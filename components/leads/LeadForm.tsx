"use client";

import { useState } from "react";
import { LeadFormData } from "@/types/lead";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadFormData) => Promise<void>;
}

const INITIAL_FORM: LeadFormData = {
  name: "",
  location: "",
  propertyRequirement: "",
  budget: "",
  buyingTimeline: "",
  customerMessage: "",
};

export default function LeadForm({ open, onOpenChange, onSubmit }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.propertyRequirement.trim())
      newErrors.propertyRequirement = "Property requirement is required";
    if (!form.budget.trim()) newErrors.budget = "Budget is required";
    if (!form.buyingTimeline.trim())
      newErrors.buyingTimeline = "Buying timeline is required";
    if (!form.customerMessage.trim())
      newErrors.customerMessage = "Customer message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(form);
      setForm(INITIAL_FORM);
      setErrors({});
      onOpenChange(false);
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof LeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">New Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Name</Label>
            <Input
              id="lead-name"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-location">Location</Label>
              <Input
                id="lead-location"
                placeholder="e.g. Mumbai, Andheri"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-budget">Budget</Label>
              <Input
                id="lead-budget"
                placeholder="e.g. ₹70L"
                value={form.budget}
                onChange={(e) => updateField("budget", e.target.value)}
              />
              {errors.budget && (
                <p className="text-xs text-destructive">{errors.budget}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-requirement">Property Requirement</Label>
              <Input
                id="lead-requirement"
                placeholder="e.g. 2BHK apartment"
                value={form.propertyRequirement}
                onChange={(e) =>
                  updateField("propertyRequirement", e.target.value)
                }
              />
              {errors.propertyRequirement && (
                <p className="text-xs text-destructive">
                  {errors.propertyRequirement}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-timeline">Buying Timeline</Label>
              <Input
                id="lead-timeline"
                placeholder="e.g. 3 months"
                value={form.buyingTimeline}
                onChange={(e) => updateField("buyingTimeline", e.target.value)}
              />
              {errors.buyingTimeline && (
                <p className="text-xs text-destructive">
                  {errors.buyingTimeline}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-message">Customer Message / Inquiry</Label>
            <Textarea
              id="lead-message"
              placeholder="Paste the customer's inquiry, transcript, or message..."
              rows={4}
              value={form.customerMessage}
              onChange={(e) => updateField("customerMessage", e.target.value)}
            />
            {errors.customerMessage && (
              <p className="text-xs text-destructive">
                {errors.customerMessage}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
