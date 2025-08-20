import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Users, FileText, Scale, Phone, Mail, MapPin } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f9fb 0%, #e8f4fd 100%);
  padding: 1rem;
  position: relative;

  // Logo de fondo
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    height: 200px;
    background: url('/imagenes/logo.png') no-repeat center center;
    background-size: contain;
    opacity: 0.05;
    z-index: 0;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (min-width: 768px) {
    padding: 2rem;
    &::before {
      width: 400px;
      height: 400px;
    }
  }
`;

const Header = styled.header`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;

  @media (min-width: 768px) {
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  img {
    height: 60px;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    background: #fff;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 2rem;
    margin-bottom: 2rem;
    
    img {
      height: 80px;
    }
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1964aaff;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 2.5rem;
    flex-direction: row;
    gap: 1rem;
  }

  @media (min-width: 480px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  line-height: 1.6;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }

  @media (min-width: 480px) {
    font-size: 1rem;
  }
`;

const BackButton = styled.button`
  background: #1964aaff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1.5rem;
  transition: background 0.2s;
  width: 100%;
  justify-content: center;

  &:hover {
    background: #2563eb;
  }

  @media (min-width: 480px) {
    width: auto;
    justify-content: flex-start;
  }

  @media (min-width: 768px) {
    padding: 12px 24px;
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const Content = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
  }
`;

const Section = styled.section`
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1964aaff;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    border-bottom: 2px solid #e8f4fd;
    padding-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 1rem 0 0.75rem 0;
  }

  p {
    font-size: 0.9rem;
    line-height: 1.6;
    color: #4a5568;
    margin: 0 0 1rem 0;
    text-align: justify;
    word-break: break-word;
  }

  ul {
    padding-left: 1rem;
    margin: 1rem 0;

    li {
      font-size: 0.9rem;
      line-height: 1.5;
      color: #4a5568;
      margin-bottom: 0.5rem;
      word-break: break-word;
    }
  }

  @media (min-width: 480px) {
    margin-bottom: 2rem;
    
    h2 {
      font-size: 1.3rem;
      align-items: center;
    }

    h3 {
      font-size: 1.1rem;
      margin: 1.5rem 0 0.75rem 0;
    }

    p, li {
      font-size: 0.95rem;
      line-height: 1.6;
    }

    ul {
      padding-left: 1.5rem;
    }
  }

  @media (min-width: 768px) {
    h2 {
      font-size: 1.5rem;
    }

    h3 {
      font-size: 1.2rem;
    }

    p, li {
      font-size: 1rem;
      line-height: 1.7;
    }
  }
`;

const DeveloperInfo = styled.div`
  background: linear-gradient(135deg, #1964aaff 0%, #2563eb 100%);
  color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  margin: 1.5rem 0;

  h3 {
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
    color: #fff;
    border: none;
    padding: 0;
  }

  p {
    font-size: 0.9rem;
    margin: 0.5rem 0;
    color: #e8f4fd;
    word-break: break-word;
  }

  @media (min-width: 768px) {
    padding: 2rem;
    border-radius: 12px;
    margin: 2rem 0;

    h3 {
      font-size: 1.3rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

const ContactInfo = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;

  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin: 0.75rem 0;
    font-size: 0.85rem;
    color: #4a5568;
    word-break: break-word;
    flex-wrap: wrap;

    span {
      flex: 1;
      min-width: 0;
    }
  }

  @media (min-width: 480px) {
    padding: 1.5rem;

    .contact-item {
      font-size: 0.9rem;
      align-items: center;
      flex-wrap: nowrap;
    }
  }

  @media (min-width: 768px) {
    .contact-item {
      font-size: 1rem;
    }
  }
`;

const LastUpdated = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  word-break: break-word;

  @media (min-width: 768px) {
    font-size: 0.9rem;
    margin-top: 2rem;
  }
`;

const PoliticasPrivacidad = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <BackButton onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </BackButton>

      <Header>
        <LogoSection>
          <img src="/imagenes/Logo-UCATECI.png" alt="Logo UCATECI" />
          <img src="/imagenes/Logo.webp" alt="Logo Farmacia GS" />
        </LogoSection>
        
        <Title>
          <Shield size={40} />
          Políticas de Privacidad
        </Title>
        
        <Subtitle>
          Farmacia GS - Sistema de Gestión Farmacéutica
        </Subtitle>
      </Header>

      <Content>
        <Section>
          <h2><FileText size={24} />Información General</h2>
          <p>
            En Farmacia GS, nos comprometemos a proteger la privacidad y seguridad de la información personal 
            de nuestros usuarios, clientes y pacientes. Esta política de privacidad describe cómo recopilamos, 
            utilizamos, almacenamos y protegemos su información personal en cumplimiento con las leyes aplicables 
            de la República Dominicana y las mejores prácticas internacionales.
          </p>
        </Section>

        <Section>
          <h2><Database size={24} />Recopilación de Información</h2>
          <h3>Información que recopilamos:</h3>
          <ul>
            <li><strong>Datos personales:</strong> Nombre, apellidos, cédula de identidad, fecha de nacimiento, dirección, teléfono y correo electrónico</li>
            <li><strong>Información médica:</strong> Prescripciones médicas, historial de medicamentos, alergias y condiciones médicas relevantes</li>
            <li><strong>Datos de transacciones:</strong> Historial de compras, métodos de pago y facturas</li>
            <li><strong>Información del sistema:</strong> Logs de acceso, direcciones IP y actividad del usuario en el sistema</li>
          </ul>
        </Section>

        <Section>
          <h2><Eye size={24} />Uso de la Información</h2>
          <p>La información recopilada se utiliza para:</p>
          <ul>
            <li>Procesamiento y dispensación de medicamentos recetados</li>
            <li>Mantenimiento del historial médico y farmacológico del paciente</li>
            <li>Facturación y procesamiento de pagos</li>
            <li>Cumplimiento de obligaciones legales y regulatorias</li>
            <li>Mejora de nuestros servicios farmacéuticos</li>
            <li>Comunicación sobre servicios de salud relevantes</li>
          </ul>
        </Section>

        <Section>
          <h2><Shield size={24} />Protección de Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información:
          </p>
          <ul>
            <li>Cifrado de datos sensibles tanto en tránsito como en reposo</li>
            <li>Control de acceso basado en roles y principio de menor privilegio</li>
            <li>Auditorías regulares de seguridad y monitoreo de accesos</li>
            <li>Backup seguro y planes de recuperación de desastres</li>
            <li>Capacitación continua del personal en protección de datos</li>
          </ul>
        </Section>

        <Section>
          <h2><Users size={24} />Derechos del Usuario</h2>
          <p>Como titular de datos personales, usted tiene derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> Solicitar información sobre los datos que tenemos sobre usted</li>
            <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
            <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos (sujeto a obligaciones legales)</li>
            <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
            <li><strong>Oposición:</strong> Oponerse al procesamiento en ciertos casos</li>
            <li><strong>Limitación:</strong> Solicitar la restricción del procesamiento</li>
          </ul>
        </Section>

        <Section>
          <h2><Scale size={24} />Marco Legal</h2>
          <p>
            Esta política de privacidad se fundamenta en las siguientes leyes y regulaciones:
          </p>
          <ul>
            <li><strong>Ley No. 172-13</strong> de Protección de Datos Personales de la República Dominicana</li>
            <li><strong>Ley No. 42-01</strong> General de Salud de la República Dominicana</li>
            <li><strong>Ley No. 344</strong> de Farmacia de la República Dominicana</li>
            <li><strong>Reglamento No. 543-12</strong> para la aplicación de la Ley General de Salud</li>
            <li><strong>Código Civil Dominicano</strong> en materia de confidencialidad</li>
            <li><strong>Principios del GDPR</strong> como referencia de mejores prácticas internacionales</li>
          </ul>
        </Section>

        <Section>
          <h2><Phone size={24} />Contacto</h2>
          <p>
            Para ejercer sus derechos o realizar consultas sobre esta política de privacidad, puede contactarnos:
          </p>
          <ContactInfo>
            <div className="contact-item">
              <Mail size={18} />
              <span>Email: privacidad@farmaciags.com.do</span>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <span>Teléfono: +1 (809) 555-0123</span>
            </div>
            <div className="contact-item">
              <MapPin size={18} />
              <span>Dirección: Calle Principal #123, Santiago, República Dominicana</span>
            </div>
          </ContactInfo>
        </Section>

        <DeveloperInfo>
          <h3>Información del Desarrollo</h3>
          <p><strong>Desarrollado por:</strong></p>
          <p>Gabriela García - Matrícula: 2023-0105</p>
          <p>Dauris Santana - Matrícula: 2023-0253</p>
          <p><strong>Institución:</strong> Universidad Católica Tecnológica del Cibao (UCATECI)</p>
          <p><strong>Programa:</strong> Ingeniería en Sistemas y Computación</p>
        </DeveloperInfo>

        <Section>
          <h2>Cambios a esta Política</h2>
          <p>
            Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. 
            Los cambios serán notificados a través del sistema y publicados en esta página. Le recomendamos 
            revisar periódicamente esta política para mantenerse informado sobre cómo protegemos su información.
          </p>
        </Section>

        <LastUpdated>
          <p>Última actualización: {new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p>© {new Date().getFullYear()} Farmacia GS. Todos los derechos reservados.</p>
        </LastUpdated>
      </Content>
    </Container>
  );
};

export default PoliticasPrivacidad;
