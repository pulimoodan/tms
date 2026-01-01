import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusSignIcon, Search01Icon, Calendar01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreditTermForm, mockCreditTermData } from "@/components/forms/credit-term-form";

const mockCreditTerms = [
  {
    id: "CT-001",
    name: "Net 15",
    days: "15",
    description: "Payment due in 15 days",
    status: "Active",
  },
  {
    id: "CT-002",
    name: "Net 30",
    days: "30",
    description: "Standard payment terms",
    status: "Active",
  },
  {
    id: "CT-003",
    name: "Net 45",
    days: "45",
    description: "Extended payment terms",
    status: "Active",
  },
  {
    id: "CT-004",
    name: "Net 60",
    days: "60",
    description: "Long term payment agreement",
    status: "Inactive",
  },
  {
    id: "CT-005",
    name: "COD",
    days: "0",
    description: "Cash on Delivery",
    status: "Active",
  },
];

export default function CreditTermsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<any>(null);

  const openNewTermSheet = () => {
    setEditingTerm(null);
    setIsSheetOpen(true);
  };

  const openEditTermSheet = (term: any) => {
    setEditingTerm(term);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Credit Terms</h1>
        <Button onClick={openNewTermSheet}>
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" /> Add Credit Term
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">Payment Terms</CardTitle>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative flex-1">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search terms..."
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term Name</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCreditTerms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                        {term.name}
                    </div>
                  </TableCell>
                  <TableCell>{term.days} Days</TableCell>
                  <TableCell className="text-muted-foreground">{term.description}</TableCell>
                  <TableCell>
                    <Badge variant={term.status === "Active" ? "default" : "secondary"}>
                      {term.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditTermSheet(term)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingTerm ? "Edit Credit Term" : "New Credit Term"}</SheetTitle>
            <SheetDescription>
              {editingTerm
                ? "Update payment term details."
                : "Define new payment terms for customers."}
            </SheetDescription>
          </SheetHeader>
          <CreditTermForm
            initialData={editingTerm}
            isEditMode={!!editingTerm}
            onComplete={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
