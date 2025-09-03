export type Calc = {
  id: string;
  title: string;
  description: string;
  href: string;
  category: 'Inmobiliario' | 'Finanzas' | 'Utilidades';
  tags?: string[];
};

export const CALCULATORS: Calc[] = [
  {
    id: 'cuit',
    title: 'Validador / Generador CUIT',
    description: 'Validá un CUIT o generálo desde DNI con dígito verificador.',
    href: '/calculadoras/cuit',
    category: 'Utilidades',
    tags: ['AFIP', 'DNI'],
  },
  {
    id: 'alquileres',
    title: 'Aumento de alquiler (ICL/IPC/CER)',
    description: 'Calculá el ajuste de contrato por índice.',
    href: '/calculadoras', // placeholder
    category: 'Inmobiliario',
  },
  {
    id: 'plazo-fijo',
    title: 'Plazo fijo (TNA / UVA)',
    description: 'Simulá rendimiento tradicional o UVA.',
    href: '/calculadoras',
    category: 'Finanzas',
  },
  {
    id: 'cbu-cvu',
    title: 'CBU / CVU',
    description: 'Validá un CBU o CVU (22 dígitos) con verificación oficial por módulo 10.',
    href: '/calculadoras/cbu-cvu',
    category: 'Finanzas',
  },
  {
    id: 'roi',
    title: 'ROI Inmobiliario',
    description: 'Calculá el retorno de inversión de un inmueble.',
    href: '/calculadoras/roi',
    category: 'Inmobiliario',
  },
  {
    id: 'sac',
    title: 'Aguinaldo (SAC)',
    description: 'Calculá el aguinaldo proporcional según días trabajados.',
    href: '/calculadoras/sac',
    category: 'Utilidades',
  },
  {
    id: 'liquidacion',
    title: 'Liquidación Final',
    description: 'Calculá la liquidación final por despido o renuncia.',
    href: '/calculadoras/liquidacion',
    category: 'Utilidades',
  }
];
