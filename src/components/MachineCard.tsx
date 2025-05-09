
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Machine } from '@/types';
import { WashingMachine, Calendar, Clock, AlertCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { MachineForm } from '@/components/admin/machines/MachineForm';

interface MachineCardProps {
  machine: Machine;
  onSelect?: () => void;
  disabled?: boolean;
  showActions?: boolean;
  showEdit?: boolean;
}

export function MachineCard({
  machine,
  onSelect,
  disabled = false,
  showActions = true,
  showEdit = false
}: MachineCardProps) {
  // Determinar ícone com base no tipo de máquina
  const MachineIcon = WashingMachine;

  return (
    <Card className={`border overflow-hidden transition-colors ${disabled ? 'opacity-60' : 'hover:border-lavapay-500'} ${onSelect && !disabled ? 'cursor-pointer' : ''}`}>
      <CardHeader className="bg-gray-50 border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MachineIcon className="h-5 w-5 text-lavapay-600" />
            <CardTitle className="text-lg">
              Máquina {machine.machine_number || ""}
            </CardTitle>
          </div>
          <StatusBadge status={machine.status} />
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{machine.time_minutes} minutos</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Disponível {machine.status === 'available' ? 'agora' : 'em breve'}</span>
          </div>
          
          <div className="flex items-center font-medium text-lg">
            R$ {machine.price.toFixed(2)}
          </div>
          
          {machine.status !== 'available' && machine.status !== 'maintenance' && (
            <div className="flex items-center text-orange-600 bg-orange-50 p-2 rounded text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Em uso no momento</span>
            </div>
          )}
          
          {machine.status === 'maintenance' && (
            <div className="flex items-center text-red-600 bg-red-50 p-2 rounded text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Em manutenção</span>
            </div>
          )}
          
          {showActions && (
            <div className="pt-2">
              {onSelect && (
                <Button 
                  className="w-full" 
                  variant={disabled ? "outline" : "default"}
                  onClick={onSelect} 
                  disabled={disabled}
                >
                  {disabled ? 'Indisponível' : 'Selecionar'}
                </Button>
              )}
              
              {showEdit && (
                <div className="mt-2">
                  <MachineForm 
                    variant="edit" 
                    machine={machine} 
                    laundryId={machine.laundry_id} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
