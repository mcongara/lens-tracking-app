import React from "react";
import { useTranslation } from "react-i18next";
import { getMonthStats, getLensUsageDaysRemaining } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Glasses, Circle } from "lucide-react";

interface StatsProps {
  month: number;
  year: number;
}

const Stats: React.FC<StatsProps> = ({ month, year }) => {
  const { t } = useTranslation();
  const stats = getMonthStats(month, year);
  const daysRemaining = getLensUsageDaysRemaining();
  const progressPercentage = ((30 - daysRemaining) / 30) * 100;
  
  const monthNames = [
    t('months.january'), 
    t('months.february'), 
    t('months.march'), 
    t('months.april'), 
    t('months.may'), 
    t('months.june'), 
    t('months.july'), 
    t('months.august'), 
    t('months.september'), 
    t('months.october'), 
    t('months.november'), 
    t('months.december')
  ];
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('stats.monthSummary', { month: monthNames[month], year })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Glasses className="h-5 w-5 mr-2" />
              <span>{t('stats.glasses', { days: stats.glasses })}</span>
            </div>
            <div className="flex items-center">
              <Circle className="h-5 w-5 mr-2" />
              <span>{t('stats.lenses', { days: stats.lenses })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('stats.lensCycle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {t('stats.daysUsed', { used: 30 - daysRemaining, total: 30 })}
              </span>
              <span className="text-sm text-muted-foreground">
                {t('stats.daysRemaining', { days: daysRemaining })}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
