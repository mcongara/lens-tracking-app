import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getEntryForDate, getCurrentDate, isLensReplacementDue, resetLensCounter } from "@/lib/storage";
import { AlertCircle } from "lucide-react";

interface DailyPromptProps {
  onSelectWearType: () => void;
}

const DailyPrompt: React.FC<DailyPromptProps> = ({ onSelectWearType }) => {
  const { t } = useTranslation();
  const currentDate = getCurrentDate();
  const todaysEntry = getEntryForDate(currentDate);
  const isReplacementDue = isLensReplacementDue();

  if (isReplacementDue) {
    return (
      <div className="w-full bg-accent animate-fade-in p-3 border-b">
        <div className="container max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{t('dailyPrompt.replaceLenses')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => resetLensCounter()}>
            {t('dailyPrompt.markAsReplaced')}
          </Button>
        </div>
      </div>
    );
  }

  if (!todaysEntry) {
    return (
      <div className="w-full bg-secondary animate-fade-in p-3 border-b">
        <div className="container max-w-3xl mx-auto flex items-center justify-between">
          <span>{t('dailyPrompt.wearQuestion')}</span>
          <Button variant="outline" size="sm" onClick={onSelectWearType}>
            {t('dailyPrompt.logToday')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default DailyPrompt;
