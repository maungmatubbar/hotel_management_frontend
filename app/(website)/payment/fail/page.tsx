import { XCircle } from "lucide-react";
import { PaymentStatusPage } from "../_components/PaymentStatusPage";

type PaymentFailPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentFailPage({ searchParams }: PaymentFailPageProps) {
  const params = await searchParams;

  return (
    <PaymentStatusPage
      eyebrow="SSLCommerz payment"
      title="Payment failed"
      description="Your payment could not be completed. Please review the details and try again."
      icon={XCircle}
      tone="red"
      searchParams={params}
    />
  );
}
