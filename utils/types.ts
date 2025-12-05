export type Task = {
  id: string;
  title?: string;
  start: string;
  end: string;
  color: string;
  done?: boolean;
  emoji?: string;
  date: string;
  weekly: boolean;
  weeklyDay?: string;
};

export type Day = {
  date: string;
};