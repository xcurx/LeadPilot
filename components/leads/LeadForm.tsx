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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadFormData) => Promise<void>;
}

const BUDGET_OPTIONS = [
  "Exploring / Not specified",
  "Under ₹30 Lakhs",
  "₹30 Lakhs - ₹50 Lakhs",
  "₹50 Lakhs - ₹1 Crore",
  "₹1 Crore - ₹3 Crores",
  "₹3 Crores - ₹5 Crores",
  "₹5 Crores+",
];

const TIMELINE_OPTIONS = [
  "Exploring / No fixed timeline",
  "Immediate (0-1 month)",
  "Short-term (1-3 months)",
  "Medium-term (3-6 months)",
  "Long-term (6+ months)",
];

const REQUIREMENT_OPTIONS = [
  "Exploring / Not specified",
  "1 BHK Apartment",
  "2 BHK Apartment",
  "3 BHK Apartment",
  "4+ BHK Apartment",
  "Villa / Independent House",
  "Plot / Land",
  "Commercial Property",
];

const INITIAL_FORM: LeadFormData = {
  name: "",
  location: "",
  propertyRequirement: REQUIREMENT_OPTIONS[0],
  budget: BUDGET_OPTIONS[0],
  buyingTimeline: TIMELINE_OPTIONS[0],
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Name <span className="text-destructive">*</span></Label>
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

            <div className="space-y-2">
              <Label htmlFor="lead-location">Location <span className="text-destructive">*</span></Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-requirement">Property Requirement</Label>
              <Select
                value={form.propertyRequirement}
                onValueChange={(v) => updateField("propertyRequirement", v as string)}
              >
                <SelectTrigger id="lead-requirement">
                  <SelectValue placeholder="Exploring / Not specified" />
                </SelectTrigger>
                <SelectContent>
                  {REQUIREMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-budget">Budget</Label>
              <Select
                value={form.budget}
                onValueChange={(v) => updateField("budget", v as string)}
              >
                <SelectTrigger id="lead-budget">
                  <SelectValue placeholder="Exploring / Not specified" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-timeline">Buying Timeline</Label>
            <Select
              value={form.buyingTimeline}
              onValueChange={(v) => updateField("buyingTimeline", v as string)}
            >
              <SelectTrigger id="lead-timeline">
                <SelectValue placeholder="Exploring / No fixed timeline" />
              </SelectTrigger>
              <SelectContent>
                {TIMELINE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-message">Customer Message / Inquiry <span className="text-destructive">*</span></Label>
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
