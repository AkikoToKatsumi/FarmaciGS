import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useElectron, useServerConfig } from '../hooks/useElectron';
import { Settings, Wifi, WifiOff, Monitor, Smartphone, Users } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f9fb 0%, #e8f4fd 100%);
  padding: 2rem;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const Title = styled.h1`
  color: #1964aaff;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: 1.1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const CardTitle = styled.h2`
  color: #1964aaff;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ConnectionStatus = styled.div<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  background: ${props => props.connected ? '#dcfce7' : '#fef2f2'};
  color: ${props => props.connected ? '#166534' : '#991b1b'};
  border: 1px solid ${props => props.connected ? '#bbf7d0' : '#fecaca'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin: 0.5rem 0;
  
  &:focus {
    outline: none;
    border-color: #1964aaff;
    box-shadow: 0 0 0 3px rgba(25, 100, 170, 0.1);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: #059669;
          color: white;
          &:hover { background: #047857; }
        `;
      case 'secondary':
        return `
          background: #6b7280;
          color: white;
          &:hover { background: #4b5563; }
        `;
      default:
        return `
          background: #1964aaff;
          color: white;
          &:hover { background: #2563eb; }
        `;
    }
  }}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const InfoBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const DeviceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DeviceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const ElectronSettings: React.FC = () => {
  const { isElectron, electronAPI, platform } = useElectron();
  const { config, saveConfig, testConnection, isLoading } = useServerConfig();
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [connectedDevices] = useState([
    { id: 1, name: 'PC Principal', type: 'desktop', ip: '192.168.1.100', status: 'online' },
    { id: 2, name: 'Laptop Farmacia', type: 'desktop', ip: '192.168.1.101', status: 'online' },
    { id: 3, name: 'Tablet Mostrador', type: 'mobile', ip: '192.168.1.102', status: 'offline' }
  ]);

  useEffect(() => {
    if (!isLoading) {
      setServerUrl(config.serverUrl);
      checkConnection();
    }
  }, [config, isLoading]);

  const checkConnection = async () => {
    if (config.serverUrl) {
      const connected = await testConnection(config.serverUrl);
      setIsConnected(connected);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const connected = await testConnection(serverUrl);
    setIsConnected(connected);
    setIsTesting(false);
  };

  const handleSaveConfig = async () => {
    const success = await saveConfig({ serverUrl });
    if (success) {
      await checkConnection();
    }
  };

  if (!isElectron) {
    return (
      <Container>
        <Header>
          <Title>
            <Monitor />
            Configuración de Escritorio
          </Title>
          <Subtitle>Esta página solo está disponible en la aplicación de escritorio</Subtitle>
        </Header>
        <Card>
          <p>Para acceder a estas configuraciones, descarga e instala la aplicación de escritorio de Farmacia GS.</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Settings />
          Configuración Multi-Dispositivo
        </Title>
        <Subtitle>
          Gestiona las conexiones entre múltiples dispositivos de escritorio
        </Subtitle>
      </Header>

      <Grid>
        {/* Configuración del Servidor */}
        <Card>
          <CardTitle>
            <Wifi />
            Conexión al Servidor
          </CardTitle>
          
          <div>
            <label>URL del Servidor:</label>
            <Input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:4004"
            />
          </div>

          <ConnectionStatus connected={isConnected}>
            {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
            {isTesting 
              ? 'Probando conexión...' 
              : isConnected 
                ? 'Conectado al servidor' 
                : 'Sin conexión al servidor'
            }
          </ConnectionStatus>

          <ButtonGroup>
            <Button 
              variant="success" 
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? 'Probando...' : 'Probar Conexión'}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveConfig}
            >
              Guardar Configuración
            </Button>
          </ButtonGroup>
        </Card>

        {/* Información del Sistema */}
        <Card>
          <CardTitle>
            <Monitor />
            Información del Sistema
          </CardTitle>
          
          <InfoBox>
            <p><strong>Plataforma:</strong> {platform}</p>
            <p><strong>Aplicación:</strong> Farmacia GS Desktop</p>
            <p><strong>Versión:</strong> 1.0.0</p>
            <p><strong>Modo:</strong> Multi-dispositivo</p>
          </InfoBox>

          <ButtonGroup>
            <Button 
              variant="secondary"
              onClick={() => electronAPI?.minimizeWindow()}
            >
              Minimizar
            </Button>
            <Button 
              variant="secondary"
              onClick={() => electronAPI?.maximizeWindow()}
            >
              Maximizar
            </Button>
          </ButtonGroup>
        </Card>

        {/* Dispositivos Conectados */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <CardTitle>
            <Users />
            Dispositivos en la Red
          </CardTitle>
          
          <DeviceList>
            {connectedDevices.map(device => (
              <DeviceItem key={device.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {device.type === 'desktop' ? <Monitor size={18} /> : <Smartphone size={18} />}
                  <div>
                    <div style={{ fontWeight: '600' }}>{device.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{device.ip}</div>
                  </div>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: device.status === 'online' ? '#dcfce7' : '#fef2f2',
                  color: device.status === 'online' ? '#166534' : '#991b1b'
                }}>
                  {device.status === 'online' ? 'En línea' : 'Desconectado'}
                </div>
              </DeviceItem>
            ))}
          </DeviceList>

          <InfoBox>
            <h4>¿Cómo conectar más dispositivos?</h4>
            <ol>
              <li>Instala la aplicación de escritorio en cada dispositivo</li>
              <li>Configura la misma URL del servidor en todos los dispositivos</li>
              <li>Asegúrate de que todos estén en la misma red</li>
              <li>Los usuarios pueden trabajar simultáneamente sin conflictos</li>
            </ol>
          </InfoBox>
        </Card>
      </Grid>
    </Container>
  );
};

export default ElectronSettings;
