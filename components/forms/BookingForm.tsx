import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BookingForm() {
  return (
    <Card className="p-6">
    <form className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="check-in">
            Check in
          </Label>
          <Input
            id="check-in"
            type="date"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="check-out">
            Check out
          </Label>
          <Input
            id="check-out"
            type="date"
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="promo">
          Promo code
        </Label>
        <div className="mt-2 flex gap-2">
          <Input
            id="promo"
            placeholder="SUMMER20"
            className="min-w-0 flex-1"
          />
          <Button variant="outline">
            Apply
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Room subtotal</span>
          <strong className="text-slate-950">$360</strong>
        </div>
        <div className="mt-2 flex justify-between">
          <span>Service fee</span>
          <strong className="text-slate-950">$18</strong>
        </div>
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base">
          <span>Total</span>
          <strong className="text-slate-950">$378</strong>
        </div>
      </div>

      <Button className="w-full">
        Confirm booking
      </Button>
    </form>
    </Card>
  );
}
