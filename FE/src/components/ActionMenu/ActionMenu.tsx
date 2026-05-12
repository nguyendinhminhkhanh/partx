import { MoreHorizontal, Pencil, Printer, Trash } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

type ActionMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
  onExport?: () => void;
};

export default function ActionMenu({ onEdit, onDelete, onExport }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Sửa
        </DropdownMenuItem>

        {onExport && (
          <DropdownMenuItem onClick={onExport}>
            <Printer className="mr-2 h-4 w-4" />
            Xuất / In
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline" size="sm">Hủy</AlertDialogCancel>
              <AlertDialogAction variant="destructive" size="sm" onClick={onDelete}>Xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
