import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import GridBento from '../../components/GridBento/GridBento';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, onDownload }) => {
  const displayName = useMemo(() => {
    const candidates = [
      user?.first_name,
      user?.firstName,
      user?.name,
      user?.username,
      user?.email
    ];
    return candidates.find(Boolean) || 'Usuario';
  }, [user]);

  const cards = useMemo(
    () => [
      {
        id: 'postlogin-ancestria',
        navLabel: 'Ancestr\u00eda',
        title: 'Ancestr\u00eda',
        description:
          'Descubre tus or\u00edgenes gen\u00e9ticos y c\u00f3mo las conexiones con distintas poblaciones han influido en tu historia ancestral.',
        cta: {
          label: 'Explorar ahora',
          href: '#postlogin-ancestria',
          ariaLabel: 'Explorar Ancestr\u00eda'
        },
        className: 'card--ancestria',
        contentJustify: 'between',
        textColor: '#4A1C5F',
        descriptionColor: '#6B2E84',
        ctaColor: '#4A1C5F',
        style: {
          backgroundColor: '#E8D4F0',
          backgroundImage: 'url(\'/Dashboard/ojo.png\')',
          backgroundSize: '100% auto',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat'
        }
      },
      {
        id: 'postlogin-rasgos',
        navLabel: 'Rasgos',
        title: 'Rasgos',
        description:
          'Conoce los rasgos gen\u00e9ticos que influyen en tu apariencia, comportamiento y habilidades \u00fanicas.',
        cta: {
          label: 'Explorar ahora',
          href: '#postlogin-rasgos',
          ariaLabel: 'Explorar Rasgos'
        },
        className: 'card--rasgos',
        textColor: '#1E3A5F',
        descriptionColor: '#2D5280',
        ctaColor: '#1E3A5F',
        style: {
          backgroundColor: '#D4E8F8',
          backgroundImage: 'url(\'/Dashboard/semicirculo.png\')',
          backgroundSize: '50% auto',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat'
        }
      },
      {
        id: 'postlogin-farmacogenetica',
        navLabel: 'Farmacogen\u00e9tica',
        title: 'Farmacogen\u00e9tica',
        description:
          'Descubre cómo tu genética influye en los medicamentos para optimizar tus tratamientos.',
        cta: {
          label: 'Explorar ahora',
          href: '#postlogin-farmacogenetica',
          ariaLabel: 'Explorar Farmacogen\u00e9tica'
        },
        className: 'card--farmacogenetica',
        textColor: '#3E3A37',
        descriptionColor: '#5A5450',
        ctaColor: '#3E3A37',
        style: {
          backgroundColor: '#F0EAE4',
          backgroundImage: 'url(\'/Dashboard/grises.png\')',
          backgroundSize: '50% auto',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }
      },
      {
        id: 'postlogin-biomarcadores',
        navLabel: 'Biomarcadores',
        title: 'Biomarcadores',
        description:
          'Identifica biomarcadores gen\u00e9ticos que revelan factores clave de tu salud, bienestar y predisposici\u00f3n.',
        cta: {
          label: 'Explorar ahora',
          href: '#postlogin-biomarcadores',
          ariaLabel: 'Explorar Biomarcadores'
        },
        className: 'card--biomarcadores',
        textColor: '#5F3A1C',
        descriptionColor: '#845C2E',
        ctaColor: '#5F3A1C',
        style: {
          backgroundColor: '#F8E8D4',
          backgroundImage: 'url(\'/Dashboard/naranjo.png\')',
          backgroundSize: '50% auto',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }
      },
      {
        id: 'postlogin-biometricas',
        navLabel: 'Biom\u00e9tricas',
        title: 'Biom\u00e9tricas',
        description:
          'Analiza tus datos biom\u00e9tricos para entender c\u00f3mo tus caracter\u00edsticas f\u00edsicas influyen en tu salud general.',
        cta: {
          label: 'Explorar ahora',
          href: '#postlogin-biometricas',
          ariaLabel: 'Explorar Biom\u00e9tricas'
        },
        className: 'card--biometricas',
        textColor: '#5F1C3E',
        descriptionColor: '#842D5A',
        ctaColor: '#5F1C3E',
        style: {
          backgroundColor: '#F8D4E8',
          backgroundImage: 'url(\'/Dashboard/estrella.png\')',
          backgroundSize: '50% auto',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }
      },
      {
        id: 'postlogin-enfermedades',
        navLabel: 'Enfermedades',
        title: 'Enfermedades',
        description:
          'Analiza tu gen\u00e9tica para conocer predisposiciones y mutaciones que pueden influir en tu salud y bienestar.',
        cta: {
          label: 'Explorar ahora',
          href: '#postlogin-enfermedades',
          ariaLabel: 'Explorar Enfermedades'
        },
        className: 'card--enfermedades',
        textColor: '#3A5F3E',
        descriptionColor: '#4F7D54',
        ctaColor: '#3A5F3E',
        style: {
          backgroundColor: '#E0F0E4',
          backgroundImage: 'url(\'/Dashboard/cuadrado.png\')',
          backgroundSize: '40% auto',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }
      }
    ],
    []
  );

  const sidebarItems = useMemo(
    () =>
      cards.map(card => ({
        label: card.navLabel ?? card.title ?? card.label,
        href: card.cta?.href ?? '#'
      })),
    [cards]
  );

  const handleDownload = onDownload ?? (() => {});

  return (
    <div className="dashboard">
      <aside className="dashboard__sidebar">
        <Sidebar items={sidebarItems} onLogout={onLogout} user={user} />
      </aside>

      <main className="dashboard__main">
        <header className="dashboard__header">
          <div className="dashboard__headline">
            <h1 className="dashboard__welcome">Bienvenido {displayName}!</h1>
            <p className="dashboard__subtitle">
              Aqui reunimos distintos grupos de enfermedades para mostrarte como tu informacion
              genetica se asocia con ellas. Explora cada categoria para descubrir una descripcion
              detallada y personalizada.
            </p>
          </div>
          <div className="dashboard__actions">
            <button type="button" className="dashboard__download" onClick={handleDownload}>
              <Download size={18} />
              Descargar PDF
            </button>
          </div>
        </header>

        <section className="dashboard__grid" aria-label="Resumen postprueba">
          <GridBento
            cards={cards}
            textAutoHide={false}
            enableSpotlight={false}
            enableTilt={false}
            enableStars={false}
            enableBorderGlow={false}
            enableMagnetism={false}
            clickEffect={false}
            glowColor="8, 133, 216"
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
