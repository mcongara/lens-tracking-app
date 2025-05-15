import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getLensUsageDaysRemaining } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Glasses, Circle } from "lucide-react";
import { api, UsageLog, UsageSummary } from "@/lib/api";
import { dataChangeEmitter } from "@/lib/events";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsProps {
  month: number;
  year: number;
  token: string;
}

const Stats: React.FC<StatsProps> = ({ month, year, token }) => {
  const { t } = useTranslation();
  const [monthlyStats, setMonthlyStats] = useState({ glasses: 0, lenses: 0 });
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const isLoading = useRef(false);

  // Function to fetch data
  const fetchData = async () => {
    // Prevent fetching if already loading or component unmounted
    if (isLoading.current || !isMounted.current) return;
    
    isLoading.current = true;
    setLoading(true);

    try {
      const [monthlyLogs, summaryData] = await Promise.all([
        api.getMonthlyLogs(token, year, month + 1), // month is 0-based
        api.getSummary(token)
      ]);

      if (isMounted.current) {
        // Calculate monthly stats
        const stats = {
          glasses: monthlyLogs.filter(log => log.wearType === 'glasses').length,
          lenses: monthlyLogs.filter(log => log.wearType === 'lenses').length
        };
        
        setMonthlyStats(stats);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isLoading.current = false;
    }
  };

  // Effect for initial fetch and cleanup
  useEffect(() => {
    isMounted.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [token, month, year]);

  // Effect for data change subscription
  useEffect(() => {
    const handleDataChange = () => {
      if (isMounted.current && !isLoading.current) {
        fetchData();
      }
    };

    const unsubscribe = dataChangeEmitter.subscribe(handleDataChange);
    return () => unsubscribe();
  }, [token, month, year]);

  const daysRemaining = summary ? Math.max(0, 30 - summary.currentLensUsageDays) : 30;
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
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span>{t('stats.glasses', { days: monthlyStats.glasses })}</span>
              )}
            </div>
            <div className="flex items-center">
              <Circle className="h-5 w-5 mr-2" />
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span>{t('stats.lenses', { days: monthlyStats.lenses })}</span>
              )}
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
              {loading ? (
                <>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">
                    {t('stats.daysUsed', { used: 30 - daysRemaining, total: 30 })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t('stats.daysRemaining', { days: daysRemaining })}
                  </span>
                </>
              )}
            </div>
            <Progress value={loading ? 0 : progressPercentage} className="h-2" />
            {!loading && summary?.lastLensReplacementDate && (
              <div className="text-sm text-muted-foreground mt-2">
                {t('stats.lastReplaced', { date: new Date(summary.lastLensReplacementDate).toLocaleDateString() })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
