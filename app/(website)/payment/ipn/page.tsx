import { RadioTower } from "lucide-react";
import { PaymentStatusPage } from "../_components/PaymentStatusPage";

type PaymentIpnPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentIpnPage({ searchParams }: PaymentIpnPageProps) {
  const params = await searchParams;

  return (
    <PaymentStatusPage
      eyebrow="SSLCommerz IPN"
      title="Payment notification received"
      description="SSLCommerz sent a payment notification. The backend can use this callback to sync invoice status."
      icon={RadioTower}
      tone="blue"
      searchParams={params}
    />
  );
}
