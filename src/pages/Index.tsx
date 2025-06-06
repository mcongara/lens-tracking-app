import React, { useState, useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import DailyPrompt from "@/components/DailyPrompt";
import SelectionModal from "@/components/SelectionModal";
import Calendar from "@/components/Calendar";
import Stats from "@/components/Stats";
import { isAuthenticated, getCurrentDate, logout, removeEntry, getEntryForDate, loadData } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Glasses, Circle, LogOut } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation();
  const [authenticated, setAuthenticated] = useState(false);
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  
  // Current month and year for calendar and stats
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Check if user is authenticated on mount and get token
  useEffect(() => {
    checkAuthAndUpdateToken();
  }, []);

  const checkAuthAndUpdateToken = () => {
    const isAuth = isAuthenticated();
    setAuthenticated(isAuth);
    const data = loadData();
    setCurrentToken(data.token);
  };
  
  const handleOpenSelection = () => {
    setEditDate(null);
    setSelectionOpen(true);
  };
  
  const handleDateClick = (date: string) => {
    const entry = getEntryForDate(date);
    if (entry) {
      setEditDate(date);
      setShowEditDialog(true);
    } else {
      setEditDate(date);
      setSelectionOpen(true);
    }
  };
  
  const handleDeleteEntry = async () => {
    if (editDate) {
      try {
        await removeEntry(editDate);
        setShowEditDialog(false);
        setConfirmDelete(false);
        setEditDate(null);
      } catch (error) {
        console.error('Error deleting entry:', error);
        // You might want to show an error toast here
      }
    }
  };
  
  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setCurrentToken(null);
  };
  
  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };
  
  const getEntryTypeIcon = (date: string | null) => {
    if (!date) return null;
    const entry = getEntryForDate(date);
    return entry?.wearType === "glasses" ? <Glasses className="h-5 w-5" /> : <Circle className="h-5 w-5" />;
  };

  if (!authenticated || !currentToken) {
    return <AuthForm onAuthenticated={checkAuthAndUpdateToken} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full bg-background border-b">
        <div className="container max-w-3xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">{t('app.title')}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label={t('navigation.logout')}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <DailyPrompt onSelectWearType={handleOpenSelection} />
      
      <main className="container max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            {t('navigation.previous')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            {t('navigation.next')}
          </Button>
        </div>
        
        <Calendar 
          month={currentMonth} 
          year={currentYear} 
          onChangeDate={handleDateClick} 
        />
        
        <Stats 
          key={currentToken} // Force remount when token changes
          month={currentMonth} 
          year={currentYear} 
          token={currentToken}
        />
      </main>
      
      <SelectionModal 
        open={selectionOpen} 
        onOpenChange={setSelectionOpen}
        selectedDate={editDate} 
      />
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editDate && t('calendar.entryFor', { date: new Date(editDate).toLocaleDateString() })}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getEntryTypeIcon(editDate)}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false);
                setSelectionOpen(true);
              }}>
                {t('actions.changeEntry')}
              </Button>
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                {t('actions.deleteEntry')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDialog.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDialog.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('confirmDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry}>
              {t('confirmDialog.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
