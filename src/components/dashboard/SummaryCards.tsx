import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentSummary } from '@/lib/types';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface SummaryCardsProps {
  summary: StudentSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Punched In Today',
      value: summary.totalPunchedIn,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Ghost Students',
      value: summary.totalGhosts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Clean Students',
      value: summary.totalClean,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`${card.borderColor} border-l-4 shadow-sm transition-shadow hover:shadow-md`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className={`${card.bgColor} ${card.color} flex h-10 w-10 items-center justify-center rounded-lg`}>
                <card.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
