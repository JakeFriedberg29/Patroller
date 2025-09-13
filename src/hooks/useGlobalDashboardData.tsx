import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { Constants } from "@/integrations/supabase/types";
import type { DateRange } from "react-day-picker";

export type OrganizationSubtype = (typeof Constants.public.Enums.organization_type)[number];
export type UserRoleFilter = "all" | "responder" | "enterprise_user" | "organization_user";
export type ReportTypeFilter = "all" | "incident"; // Placeholder until report instances exist
export type AccountTypeFilter = "all" | "organizations" | "enterprises";
export type EnterpriseSubtype = "Resort Chain" | "Municipality" | "Park Agency" | "Event Management";

export interface GlobalKpis {
  totalAccounts: number;
  totalUsers: number;
  totalReports: number;
}

export interface AccountsOverTimePoint {
  month: string; // YYYY-MM
  totalAccounts: number;
  organizations: number;
  enterprises: number;
}

export interface UsersOverTimePoint {
  month: string; // YYYY-MM
  users: number;
}

export interface ReportsByTypePoint {
  type: string;
  pending: number;
  approved: number;
  rejected: number;
}

export interface EnterpriseSubtypeSlice {
  subtype: EnterpriseSubtype;
  value: number;
}

function formatMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function monthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function enumerateMonths(from: Date, to: Date): string[] {
  const start = monthStart(from);
  const end = monthEnd(to);
  const months: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    months.push(formatMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function mapOrgTypeToEnterpriseSubtype(orgType: OrganizationSubtype): EnterpriseSubtype {
  switch (orgType) {
    case "ski_patrol":
      return "Resort Chain";
    case "event_medical":
      return "Event Management";
    case "park_service":
      return "Park Agency";
    case "lifeguard_service":
    case "harbor_master":
    case "search_and_rescue":
    case "volunteer_emergency_services":
    default:
      return "Municipality";
  }
}

export const useGlobalDashboardData = (
  dateRange: DateRange | undefined,
  options?: {
    accountType?: AccountTypeFilter; // single-choice: all | organizations | enterprises
    accountsOrgSubtypes?: OrganizationSubtype[]; // multi-select
    accountsEnterpriseSubtypes?: EnterpriseSubtype[]; // multi-select
    usersRoleFilters?: UserRoleFilter[]; // multi-select
    reportsTypeFilters?: ReportTypeFilter[]; // multi-select
    reportsOrgSubtypes?: OrganizationSubtype[]; // multi-select
  }
) => {
  const { toast } = useToast();
  const { isPlatformAdmin } = usePermissions();

  const [kpis, setKpis] = useState<GlobalKpis>({ totalAccounts: 0, totalUsers: 0, totalReports: 0 });
  const [accountsOverTime, setAccountsOverTime] = useState<AccountsOverTimePoint[]>([]);
  const [usersOverTime, setUsersOverTime] = useState<UsersOverTimePoint[]>([]);
  const [reportsByType, setReportsByType] = useState<ReportsByTypePoint[]>([]);
  const [enterpriseSubtypeDistribution, setEnterpriseSubtypeDistribution] = useState<EnterpriseSubtypeSlice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fromDate = dateRange?.from ?? new Date(new Date().getFullYear(), 0, 1);
  const toDate = dateRange?.to ?? new Date();
  const monthKeys = useMemo(() => enumerateMonths(fromDate, toDate), [fromDate, toDate]);

  const accountType = options?.accountType ?? "all";
  const accountsOrgSubtypes = options?.accountsOrgSubtypes ?? [];
  const accountsEnterpriseSubtypes = options?.accountsEnterpriseSubtypes ?? [];
  const usersRoleFilters = options?.usersRoleFilters ?? [];
  const reportsTypeFilters = options?.reportsTypeFilters ?? [];
  const reportsOrgSubtypes = options?.reportsOrgSubtypes ?? [];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        if (!isPlatformAdmin) {
          setKpis({ totalAccounts: 0, totalUsers: 0, totalReports: 0 });
          setAccountsOverTime([]);
          setUsersOverTime([]);
          setReportsByType([]);
          setEnterpriseSubtypeDistribution([]);
          return;
        }

        // 1) KPIs
        const [enterpriseCountHead, orgCountHead, usersCountHead] = await Promise.all([
          supabase.from("enterprises").select("id", { count: "exact", head: true }),
          supabase.from("organizations").select("id", { count: "exact", head: true }),
          supabase.from("users").select("id", { count: "exact", head: true }).eq("status", "active"),
        ]);

        const enterprisesTotal = enterpriseCountHead.count ?? 0;
        const organizationsTotal = orgCountHead.count ?? 0;
        const usersTotal = usersCountHead.count ?? 0;

        setKpis({
          totalAccounts: enterprisesTotal + organizationsTotal,
          totalUsers: usersTotal,
          totalReports: 0,
        });

        // 2) Accounts over time (cumulative)
        const endIso = monthEnd(toDate).toISOString();
        const [enterpriseRows, organizationRows, orgsForClassification] = await Promise.all([
          supabase
            .from("enterprises")
            .select("id, created_at")
            .lte("created_at", endIso),
          supabase
            .from("organizations")
            .select("id, created_at, organization_type")
            .lte("created_at", endIso),
          supabase
            .from("organizations")
            .select("id, tenant_id, organization_type"),
        ]);

        // Build enterprise -> subtype map from organizations
        const enterpriseSubtypeMap = new Map<string, EnterpriseSubtype>();
        const subtypeCountsByEnterprise = new Map<string, Record<EnterpriseSubtype, number>>();
        (orgsForClassification.data || []).forEach((o: any) => {
          const subtype = mapOrgTypeToEnterpriseSubtype(o.organization_type as OrganizationSubtype);
          const counts = subtypeCountsByEnterprise.get(o.tenant_id) || {
            "Resort Chain": 0,
            "Municipality": 0,
            "Park Agency": 0,
            "Event Management": 0,
          };
          counts[subtype] += 1;
          subtypeCountsByEnterprise.set(o.tenant_id, counts);
        });
        // Decide subtype per enterprise: max count (tie -> Municipality)
        subtypeCountsByEnterprise.forEach((counts, tenantId) => {
          let chosen: EnterpriseSubtype = "Municipality";
          let max = -1;
          (Object.keys(counts) as EnterpriseSubtype[]).forEach((k) => {
            const v = counts[k];
            if (v > max) {
              max = v; chosen = k;
            }
          });
          enterpriseSubtypeMap.set(tenantId, chosen);
        });

        const orgSubtypeSelected = new Set<OrganizationSubtype>(accountsOrgSubtypes);
        const entSubtypeSelected = new Set<EnterpriseSubtype>(accountsEnterpriseSubtypes);
        const filterOrgSubtype = orgSubtypeSelected.size > 0;
        const filterEntSubtype = entSubtypeSelected.size > 0;

        const includeEnterprises = accountType === "all" || accountType === "enterprises";
        const includeOrganizations = accountType === "all" || accountType === "organizations";

        const enterpriseMonths = includeEnterprises
          ? (enterpriseRows.data || [])
              .filter((r: any) => !filterEntSubtype || entSubtypeSelected.has(enterpriseSubtypeMap.get(r.id) || "Municipality"))
              .map((r: any) => formatMonthKey(new Date(r.created_at)))
          : [];

        const organizationMonths = includeOrganizations
          ? (organizationRows.data || [])
              .filter((r: any) => !filterOrgSubtype || orgSubtypeSelected.has(r.organization_type))
              .map((r: any) => formatMonthKey(new Date(r.created_at)))
          : [];

        const accountsSeries: AccountsOverTimePoint[] = monthKeys.map((k) => {
          const enterprises = enterpriseMonths.filter((mk) => mk <= k).length;
          const orgs = organizationMonths.filter((mk) => mk <= k).length;
          return { month: k, totalAccounts: enterprises + orgs, organizations: orgs, enterprises };
        });
        setAccountsOverTime(accountsSeries);

        // 3) Users over time (cumulative active users by month)
        const { data: usersRows } = await supabase
          .from("users")
          .select("id, created_at, status")
          .lte("created_at", endIso);

        let allowedUserIds: Set<string> | null = null;
        const rolesSelected = new Set<UserRoleFilter>(usersRoleFilters);
        const filterRoles = rolesSelected.size > 0 && !rolesSelected.has("all");
        if (filterRoles) {
          const { data: roleRows } = await supabase
            .from("user_roles")
            .select("user_id, role_type, is_active");
          allowedUserIds = new Set(
            (roleRows || [])
              .filter((r: any) => r.is_active && rolesSelected.has(r.role_type))
              .map((r: any) => r.user_id)
          );
        }

        const filteredActiveUsers = (usersRows || []).filter((u: any) => u.status === "active" && (!allowedUserIds || allowedUserIds.has(u.id)));
        const userMonths = filteredActiveUsers.map((u: any) => formatMonthKey(new Date(u.created_at)));

        const usersSeries: UsersOverTimePoint[] = monthKeys.map((k) => ({
          month: k,
          users: userMonths.filter((mk) => mk <= k).length,
        }));
        setUsersOverTime(usersSeries);

        // 4) Reports by type (no report instances yet)
        setReportsByType([]);

        // 5) Enterprise subtypes distribution (based on orgs classification)
        const sliceCounts: Record<EnterpriseSubtype, number> = {
          "Resort Chain": 0,
          "Municipality": 0,
          "Park Agency": 0,
          "Event Management": 0,
        };
        (enterpriseRows.data || []).forEach((e: any) => {
          const subtype = enterpriseSubtypeMap.get(e.id) || "Municipality";
          sliceCounts[subtype] += 1;
        });
        const distribution: EnterpriseSubtypeSlice[] = [
          { subtype: "Resort Chain", value: sliceCounts["Resort Chain"] },
          { subtype: "Municipality", value: sliceCounts["Municipality"] },
          { subtype: "Park Agency", value: sliceCounts["Park Agency"] },
          { subtype: "Event Management", value: sliceCounts["Event Management"] },
        ];
        setEnterpriseSubtypeDistribution(distribution);
      } catch (error) {
        console.error("Error loading global dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load global dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    isPlatformAdmin,
    fromDate.getTime(),
    toDate.getTime(),
    accountType,
    accountsOrgSubtypes.join("|"),
    accountsEnterpriseSubtypes.join("|"),
    usersRoleFilters.join("|"),
    reportsTypeFilters.join("|"),
    reportsOrgSubtypes.join("|"),
    toast,
  ]);

  return {
    kpis,
    accountsOverTime,
    usersOverTime,
    reportsByType,
    enterpriseSubtypeDistribution,
    loading,
    monthKeys,
  };
};
