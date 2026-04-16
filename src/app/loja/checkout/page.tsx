import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutContent from "./_CheckoutContent";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />
      <div className="mt-16 flex-1 flex flex-col">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#ff1f1f] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
