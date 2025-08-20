# Validaciones de Duplicados - Farmacia GS

## Resumen de Validaciones Implementadas

Este documento describe las validaciones de duplicados implementadas en el sistema para evitar información repetida entre usuarios, productos, clientes, empleados y proveedores.

## 🔒 Validaciones a Nivel de Base de Datos

Se agregaron las siguientes constraints únicas para garantizar integridad de datos:

### Tabla `users`
- ✅ **email**: Ya existía constraint único

### Tabla `clients`
- ✅ **email**: Constraint único agregado
- ✅ **phone**: Constraint único agregado  
- ✅ **cedula**: Constraint único agregado
- ✅ **rnc**: Constraint único agregado

### Tabla `employees`
- ✅ **email**: Constraint único agregado
- ✅ **phone**: Constraint único agregado

### Tabla `providers`
- ✅ **email**: Constraint único agregado
- ✅ **phone**: Constraint único agregado
- ✅ **tax_id**: Constraint único agregado

### Tabla `medicine`
- ✅ **barcode**: Constraint único agregado
- ✅ **name + lot**: Constraint único compuesto agregado

## 🛡️ Validaciones a Nivel de Aplicación

### Controladores Actualizados

#### 1. **Clientes** (`clients.controller.ts`)
- Valida email único antes de crear/actualizar
- Valida teléfono único antes de crear/actualizar
- Valida cédula única (si se proporciona)
- Valida RNC único (si se proporciona)
- Formato de email válido
- Formato de teléfono válido

#### 2. **Empleados** (`employees.controller.ts`)
- Valida email único en tabla `users`
- Valida email único en tabla `employees`
- Valida teléfono único (si se proporciona)
- Solo permite empleados activos con información única

#### 3. **Proveedores** (`provider.controller.ts`)
- Valida email único antes de crear/actualizar
- Valida teléfono único antes de crear/actualizar
- Valida tax_id único antes de crear/actualizar
- Formato de email válido
- Formato de teléfono válido

#### 4. **Medicamentos** (`inventory.controller.ts`)
- Valida código de barras único
- Valida combinación nombre + lote única
- Genera código de barras automático si no se proporciona

#### 5. **Usuarios** (`users.controller.ts`)
- Valida email único antes de crear

### Validadores Actualizados

#### 1. **Client Validator** (`client.validator.ts`)
- Validación completa de duplicados
- Validación de formatos
- Manejo de casos de actualización (excluir registro actual)

#### 2. **Employee Validator** (`employee.validator.ts`)
- Agregada validación de formato de teléfono

#### 3. **Provider Validator** (`provider.validator.ts`)
- Ya tenía validaciones completas

## 📋 Campos Únicos por Entidad

| Entidad | Campos Únicos | Validación Backend | Constraint DB |
|---------|---------------|-------------------|---------------|
| **Users** | email | ✅ | ✅ |
| **Clients** | email, phone, cedula, rnc | ✅ | ✅ |
| **Employees** | email, phone | ✅ | ✅ |
| **Providers** | email, phone, tax_id | ✅ | ✅ |
| **Medicine** | barcode, name+lot | ✅ | ✅ |

## 🚀 Instalación de Constraints

Para aplicar las constraints de base de datos, ejecuta:

```bash
cd backend
psql -d farmaciagsdb -f database/migrations/add_unique_constraints.sql
```

## 📱 Mensajes de Error

Los controladores ahora devuelven mensajes específicos:

- **Email duplicado**: "Ya existe un [entidad] con ese correo electrónico"
- **Teléfono duplicado**: "Ya existe un [entidad] con ese número de teléfono"
- **Cédula duplicada**: "Ya existe un cliente con esa cédula"
- **RNC duplicado**: "Ya existe un cliente con ese RNC"
- **Tax ID duplicado**: "Ya existe un proveedor con ese número de identificación fiscal"
- **Código de barras duplicado**: "Ya existe un medicamento con ese código de barras"
- **Nombre+Lote duplicado**: "Ya existe un medicamento con el mismo nombre y lote"

## ⚠️ Consideraciones Importantes

1. **Actualización vs Creación**: Las validaciones excluyen el registro actual al actualizar
2. **Campos Opcionales**: Cédula, RNC y teléfono se validan solo si se proporcionan
3. **Case Insensitive**: Los emails se comparan sin distinción de mayúsculas/minúsculas
4. **Limpieza de Datos**: El script de migración elimina duplicados existentes antes de aplicar constraints
5. **Empleados Inactivos**: Se permite reactivar empleados con el mismo email si están inactivos

## 🔧 Testing

Para probar las validaciones:

1. Intenta crear dos clientes con el mismo email
2. Intenta crear dos empleados con el mismo teléfono  
3. Intenta crear dos proveedores con el mismo tax_id
4. Intenta crear dos medicamentos con mismo nombre y lote

Todas estas operaciones deberían fallar con mensajes de error apropiados.

## 📞 Soporte

Si encuentras algún problema con las validaciones, revisa:

1. Que el script de migración se ejecutó correctamente
2. Que no hay datos duplicados existentes
3. Que los formatos de entrada son válidos
4. Los logs del servidor para errores específicos
