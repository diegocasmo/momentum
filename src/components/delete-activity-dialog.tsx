"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { softDeleteActivityAction } from "@/app/actions/soft-delete-activity-action";
import { toast } from "@/hooks/use-toast";
import type { Activity } from "@prisma/client";

type DeleteActivityDialogProps = {
  activity: Activity;
  redirectUrl?: string;
};

const ERROR_MESSAGE_CONFIG: Parameters<typeof toast>[0] = {
  title: "Error",
  description: "Failed to delete the activity. Please try again.",
  variant: "destructive" as const,
};

export function DeleteActivityDialog({
  activity,
  redirectUrl,
}: DeleteActivityDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const result = await softDeleteActivityAction(activity.id);
      if (result.success) {
        toast({
          title: "Activity deleted",
          description: `"${activity.name}" has been successfully deleted.`,
        });
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.refresh();
        }
      } else {
        toast(ERROR_MESSAGE_CONFIG);
      }
    } catch (error) {
      console.error("Activity deletion error:", error);
      toast(ERROR_MESSAGE_CONFIG);
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div onClick={(e) => e.preventDefault()}>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full cursor-pointer hover:text-destructive focus:text-destructive justify-start"
            aria-label={`Delete ${activity.name}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the activity &quot;{activity.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
