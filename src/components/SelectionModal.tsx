import React from "react";
import { useTranslation } from "react-i18next";
import { addEntry, getCurrentDate } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Glasses, Circle } from "lucide-react";

interface SelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ open, onOpenChange, selectedDate }) => {
  const { t } = useTranslation();
  
  const handleSelect = (wearType: "glasses" | "lenses") => {
    const dateToUpdate = selectedDate || getCurrentDate();
    addEntry(dateToUpdate, wearType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {selectedDate 
              ? t('selectionModal.whatWoreOn', { 
                  date: new Date(selectedDate).toLocaleDateString() 
                })
              : t('selectionModal.whatWoreToday')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col h-24 items-center justify-center hover:bg-secondary"
            onClick={() => handleSelect("glasses")}
          >
            <Glasses className="h-8 w-8 mb-2" />
            <span>{t('selectionModal.glasses')}</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col h-24 items-center justify-center hover:bg-secondary"
            onClick={() => handleSelect("lenses")}
          >
            <Circle className="h-8 w-8 mb-2" />
            <span>{t('selectionModal.contactLenses')}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectionModal;
