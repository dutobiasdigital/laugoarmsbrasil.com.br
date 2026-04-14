import Header from "@/components/Header";
import CheckoutContent from "./_CheckoutContent";

export const metadata = {
  title: "Checkout — Revista Magnum",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <CheckoutContent />
    </div>
  );
}
