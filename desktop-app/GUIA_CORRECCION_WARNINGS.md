# Guía para corregir warnings de styled-components

## Problema
Los warnings aparecen porque styled-components está recibiendo props personalizadas que se pasan al DOM.

## Solución
Usar "transient props" (prefijo `$`) para props que solo se usan para estilos.

## Cambios necesarios en `src/pages/Dashboard.tsx`

### 1. Actualizar definiciones de styled components

Busca y reemplaza en el archivo:

```typescript
// LÍNEA ~33
// ANTES:
const Sidebar = styled.nav<{ collapsed: boolean; isMobile: boolean }>`

// DESPUÉS:
const Sidebar = styled.nav<{ $collapsed: boolean; $isMobile: boolean }>`
```

```typescript
// LÍNEA ~63
// ANTES:
const SidebarOverlay = styled.div<{ show: boolean }>`

// DESPUÉS:
const SidebarOverlay = styled.div<{ $show: boolean }>`
```

```typescript
// LÍNEA ~78
// ANTES:
const SidebarLogo = styled.div<{ collapsed: boolean; isMobile: boolean }>`

// DESPUÉS:
const SidebarLogo = styled.div<{ $collapsed: boolean; $isMobile: boolean }>`
```

```typescript
// LÍNEA ~108
// ANTES:
const SidebarMenuItem = styled.li<{ active?: boolean; collapsed?: boolean; isMobile?: boolean }>`

// DESPUÉS:
const SidebarMenuItem = styled.li<{ $active?: boolean; $collapsed?: boolean; $isMobile?: boolean }>`
```

```typescript
// LÍNEA ~372
// ANTES:
const SidebarToggle = styled.button<{ isMobile: boolean }>`

// DESPUÉS:
const SidebarToggle = styled.button<{ $isMobile: boolean }>`
```

### 2. Actualizar las referencias dentro de los styled components

Dentro de cada definición de styled component, reemplaza las referencias a las props:

```typescript
// Ejemplo en Sidebar (líneas 38-59):
//ANTES:
width: ${({ collapsed, isMobile }) => {

// DESPUÉS:
width: ${({ $collapsed, $isMobile }) => {

// Y así con todas las referencias dentro de cada componente
```

### 3. Actualizar el uso en JSX (líneas 800-900 aproximadamente)

```tsx
// ANTES:
<Sidebar collapsed={sidebarCollapsed} isMobile={isMobile}>

// DESPUÉS:
<Sidebar $collapsed={sidebarCollapsed} $isMobile={isMobile}>
```

```tsx
// ANTES:
<SidebarOverlay show={isMobile && !sidebarCollapsed} onClick={handleOverlayClick} />

// DESPUÉS:
<SidebarOverlay $show={isMobile && !sidebarCollapsed} onClick={handleOverlayClick} />
```

```tsx
// ANTES:
<SidebarLogo collapsed={sidebarCollapsed} isMobile={isMobile}>

// DESPUÉS:
<SidebarLogo $collapsed={sidebarCollapsed} $isMobile={isMobile}>
```

```tsx
// ANTES:
<SidebarMenuItem active={item.active} collapsed={sidebarCollapsed} isMobile={isMobile}>

// DESPUÉS:
<SidebarMenuItem $active={item.active} $collapsed={sidebarCollapsed} $isMobile={isMobile}>
```

```tsx
// ANTES:
<SidebarToggle isMobile={isMobile} onClick={handleSidebarToggle}>

// DESPUÉS:
<SidebarToggle $isMobile={isMobile} onClick={handleSidebarToggle}>
```

## Nota importante
Estos warnings NO afectan la funcionalidad de la aplicación, solo aparecen en la consola del navegador durante el desarrollo. Puedes ignorarlos si prefieres enfocarte en otras funcionalidades.
