import { Ban } from "lucide-react";
import { PaymentStatusPage } from "../_components/PaymentStatusPage";

type PaymentCancelPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentCancelPage({ searchParams }: PaymentCancelPageProps) {
  const params = await searchParams;

  return (
    <PaymentStatusPage
      eyebrow="SSLCommerz payment"
      title="Payment cancelled"
      description="The payment session was cancelled. Your booking payment was not completed."
      icon={Ban}
      tone="amber"
      searchParams={params}
    />
  );
}
