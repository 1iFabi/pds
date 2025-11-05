# Implementación de SectionHeader en Todas las Subsecciones

## Resumen de cambios realizados ✅

He creado un componente reutilizable `SectionHeader` que aplica el estilo azul del AdminReports a todas las subsecciones genéticas.

### Archivos creados:

1. **`src/components/SectionHeader/SectionHeader.jsx`** - Componente reutilizable
2. **`src/components/SectionHeader/SectionHeader.css`** - Estilos del componente
3. **`src/components/SectionHeader/README.md`** - Documentación del componente
4. **`src/pages/Rasgos/Rasgos.jsx`** - Ejemplo de implementación
5. **`src/pages/Rasgos/Rasgos.css`** - Estilos base para una subsección

### Archivos modificados:

1. **`src/pages/Enfermedades/Enfermedades.jsx`** - Usa SectionHeader
2. **`src/pages/Enfermedades/Enfermedades.css`** - Limpiado (estilos movidos al componente)

---

## Cómo implementar en otras subsecciones

### Paso 1: Crear página de subsección (ej: Ancestría)

Copiar la estructura de `src/pages/Rasgos/Rasgos.jsx` pero:
- Cambiar nombre de clase de `rasgos` a `ancestria` (o la subsección que sea)
- Cambiar el icono de `Sparkles` a `Globe` (o el que corresponda)
- Actualizar el título y subtítulo

```jsx
import { Globe } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader/SectionHeader';

// Dentro del JSX:
<SectionHeader
  title="Ancestría"
  subtitle="Descubre tus orígenes genéticos y cómo las conexiones con distintas poblaciones..."
  icon={Globe}
/>
```

### Paso 2: Crear CSS de la subsección

Copiar `src/pages/Rasgos/Rasgos.css` reemplazando:
- `.rasgos-` por `.ancestria-` (o la subsección que sea)
- Mantener los estilos del layout que funcionan bien

### Paso 3: Actualizar rutas (router)

Añadir en `src/pages/Postlogin/PostloginRouter.jsx`:

```jsx
import Ancestria from '../Ancestria/Ancestria';
import Rasgos from '../Rasgos/Rasgos';

<Route path="/dashboard/ancestria" element={<Ancestria />} />
<Route path="/dashboard/rasgos" element={<Rasgos />} />
```

### Paso 4: Actualizar sidebar items

En cada página, actualizar `sidebarItems` con las rutas correctas:

```jsx
const sidebarItems = useMemo(() => [
  { label: 'Ancestría', href: '/dashboard/ancestria' },
  { label: 'Rasgos', href: '/dashboard/rasgos' },
  { label: 'Farmacogenética', href: '/dashboard/farmacogenetica' },
  { label: 'Biomarcadores', href: '/dashboard/biomarcadores' },
  { label: 'Biométricas', href: '/dashboard/biometricas' },
  { label: 'Enfermedades', href: '/dashboard/enfermedades' },
], []);
```

---

## Iconos sugeridos por sección

| Sección | Icono | Importación |
|---------|-------|-------------|
| Ancestría | `Globe` | `import { Globe } from 'lucide-react'` |
| Rasgos | `Sparkles` | `import { Sparkles } from 'lucide-react'` |
| Farmacogenética | `Pill` | `import { Pill } from 'lucide-react'` |
| Biomarcadores | `Microscope` | `import { Microscope } from 'lucide-react'` |
| Biométricas | `Heart` | `import { Heart } from 'lucide-react'` |
| Enfermedades | `Activity` | `import { Activity } from 'lucide-react'` |

---

## Estructura de carpetas esperada

```
src/
├── components/
│   └── SectionHeader/
│       ├── SectionHeader.jsx
│       ├── SectionHeader.css
│       └── README.md
└── pages/
    ├── Ancestria/
    │   ├── Ancestria.jsx
    │   └── Ancestria.css
    ├── Rasgos/
    │   ├── Rasgos.jsx
    │   └── Rasgos.css
    ├── Farmacogenetica/
    │   ├── Farmacogenetica.jsx
    │   └── Farmacogenetica.css
    ├── Biomarcadores/
    │   ├── Biomarcadores.jsx
    │   └── Biomarcadores.css
    ├── Biometricas/
    │   ├── Biometricas.jsx
    │   └── Biometricas.css
    └── Enfermedades/
        ├── Enfermedades.jsx
        └── Enfermedades.css
```

---

## Notas importantes

### API Endpoints

Cada subsección necesitará su endpoint correspondiente. Por ejemplo:

- `API_ENDPOINTS.DISEASES` para enfermedades
- `API_ENDPOINTS.TRAITS` para rasgos
- `API_ENDPOINTS.ANCESTRY` para ancestría
- etc.

Si algunos endpoints no existen, hay comentarios en `Rasgos.jsx` indicando dónde ajustarlo.

### Estilo visual

El componente `SectionHeader` incluye:
- ✅ Fondo azul gradiente (mismo que AdminReports)
- ✅ Bordes redondeados (border-radius: 16px)
- ✅ Icono con background semi-transparente
- ✅ Responsive (se adapta a móviles)
- ✅ Sombra sutil
- ✅ Tipografía blanca

No se necesita agregar CSS adicional en las páginas.

### Mobile responsiveness

Todas las páginas incluyen:
- ✅ Burger menu
- ✅ Sidebar colapsable
- ✅ Padding responsive
- ✅ Grid adaptable

---

## Para aplicar a Dashboard (en caso de integrar allí)

Si quieres usar SectionHeader en las cards del Dashboard, puedes envolverlo así:

```jsx
// En GridBento.jsx o donde muestres los cards

{cards.map((card) => (
  <div key={card.id} className="card-wrapper">
    {card.id === 'postlogin-enfermedades' && (
      <SectionHeader 
        title={card.title}
        subtitle={card.description}
      />
    )}
    {/* resto del card */}
  </div>
))}
```

Pero recomendamos mantener las subsecciones como páginas separadas (como está ahora con Enfermedades).

---

## Próximos pasos

1. ✅ Enfermedades - Ya implementado con SectionHeader
2. ⏳ Rasgos - Template listo, solo necesita endpoints API
3. ⏳ Ancestría - Crear siguiendo el patrón de Rasgos
4. ⏳ Farmacogenética - Crear siguiendo el patrón de Rasgos
5. ⏳ Biomarcadores - Crear siguiendo el patrón de Rasgos
6. ⏳ Biométricas - Crear siguiendo el patrón de Rasgos

Todos compartirán el mismo componente `SectionHeader` para mantener consistencia.
