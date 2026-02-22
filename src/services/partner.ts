import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/utils/api-client";

//  TYPES ---
export interface ReferralEvent {
  id: string;
  createdAt: string | Date;
  eventType: "registration" | "payment";
  referredUserId: string;
  commissionAmount?: number | null;
  status: "pending" | "paid" | "rejected";
}

export interface MonthlyRevenue {
  name: string; // e.g., 'Янв', 'Фев'
  total: number;
}

export interface PartnerDashboardData {
  partnerId: string;
  referralId: string;
  balance: number;
  totalEarned: number;
  totalRegistrations: number;
  totalPaidConversions: number;
  clicks: number;
  monthlyRevenue: MonthlyRevenue[];
  referralEvents: ReferralEvent[];
  minPayout: number;
  paymentDetails: string | null;
}

export interface PartnershipFormValues {
  name: string;
  email: string;
  website: string;
}

//  RAW API FUNCTIONS ---

export const getPartnerDashboardData = async (
  userId: string,
): Promise<PartnerDashboardData> => {
  return apiRequest<PartnerDashboardData>({
    method: "get",
    url: `/api/partners/${userId}/dashboard`,
  });
};

export const updatePartnerPaymentDetails = async (
  userId: string,
  paymentDetails: string,
) => {
  return apiRequest<{ message: string }>({
    method: "patch",
    url: `/api/partners/${userId}/payment-details`,
    data: { paymentDetails },
  });
};

export const requestPayout = async (userId: string) => {
  return apiRequest<{ message: string; data: any }>({
    method: "post",
    url: `/api/partners/${userId}/payouts`,
  });
};

// REACT QUERY HOOKS ---

// Hook to fetch dashboard data
export const usePartnerDashboard = (userId?: string) => {
  return useQuery({
    queryKey: ["partnerDashboard", userId],
    queryFn: () => getPartnerDashboardData(userId!),
    enabled: !!userId, // Only run the query if userId exists (e.g., user is logged in)
    staleTime: 1000 * 60 * 5, // Cache the data for 5 minutes to prevent spamming the backend
  });
};

// Hook to update payment details
export const useUpdatePaymentDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      partnerId,
      paymentDetails,
    }: {
      partnerId: string;
      paymentDetails: string;
    }) => updatePartnerPaymentDetails(partnerId, paymentDetails),
    onSuccess: (_, variables) => {
      // Instantly refresh the dashboard data after a successful update
      queryClient.invalidateQueries({
        queryKey: ["partnerDashboard", variables.partnerId],
      });
    },
  });
};

// Hook to request a payout
export const useRequestPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => requestPayout(userId),
    onSuccess: (_, userId) => {
      // Instantly refresh the dashboard data so the balance goes down to 0 in the UI
      queryClient.invalidateQueries({ queryKey: ["partnerDashboard", userId] });
    },
  });
};

export const useSubmitPartnership = () => {
  return useMutation<{ message: string }, ApiError, PartnershipFormValues>({
    mutationFn: (data) =>
      apiRequest({
        method: "post",
        url: "/api/partners/partnership-request",
        data,
      }),
  });
};
