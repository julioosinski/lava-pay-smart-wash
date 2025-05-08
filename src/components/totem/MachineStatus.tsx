import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useESP32Monitoring } from '@/hooks/useESP32Monitoring';
import { CheckCircle, WifiOff, AlertCircle, Clock, Wifi, WifiLow } from 'lucide-react';

interface MachineStatusDisplayProps {
  machineId: string;
  machineName: string;
}

export function MachineStatusDisplay({ machineId, machineName }: MachineStatusDisplayProps) {
  const { isConnected, machineStatus, wifiSignal, refreshConnectionStatus, refreshMachineStatus } = useESP32Monitoring(machineId);
  const [remainingTimeText, setRemainingTimeText] = useState<string>('');
  
  useEffect(() => {
    if (machineStatus?.remainingTime) {
      const updateTimeText = () => {
        if (!machineStatus.remainingTime) return;
        
        const minutes = Math.floor(machineStatus.remainingTime / 60);
        const seconds = Math.floor(machineStatus.remainingTime % 60);
        setRemainingTimeText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      
      updateTimeText();
      const timer = setInterval(updateTimeText, 1000);
      
      return () => clearInterval(timer);
    }
  }, [machineStatus?.remainingTime]);
  
  const renderWifiSignal = () => {
    if (!isConnected) return <WifiOff className="h-5 w-5 text-red-500" />;
    
    if (wifiSignal && wifiSignal >= -50) {
      return <Wifi className="h-5 w-5 text-green-500" />;
    } else if (wifiSignal && wifiSignal >= -70) {
      return <WifiLow className="h-5 w-5 text-yellow-500" />;
    } else {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Status da Máquina {machineName}
          <button onClick={() => refreshMachineStatus()} className="text-sm text-gray-500 hover:text-gray-700">
            Atualizar
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {renderWifiSignal()}
              <span className="ml-2">
                {isConnected ? 'Máquina Online' : 'Máquina Offline'}
              </span>
            </div>
            {wifiSignal && (
              <span className="text-sm text-gray-500">
                {wifiSignal} dBm
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            {machineStatus?.isUnlocked ? (
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
            )}
            <span>
              {machineStatus?.isUnlocked ? 'Máquina em Uso' : 'Máquina Disponível'}
            </span>
          </div>
          
          {machineStatus?.remainingTime && machineStatus?.isUnlocked && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              <span>Tempo Restante: {remainingTimeText}</span>
            </div>
          )}
          
          {machineStatus?.errorCode && (
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              <span>Erro: {machineStatus.errorCode}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
