import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Proforma } from '../Interface/Proforma';

// Definir tipos para las fuentes
type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

interface FuenteConfig {
  size: number;
  weight: FontStyle;
}

export function generarPDFProforma(proforma: Proforma, descripcionPredeterminada: string = '') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ═══════════════════════════════════════════
  // 🎨 CONFIGURACIÓN DE DISEÑO - CON CONTROL DE FUENTES
  // ═══════════════════════════════════════════
  const CONFIG = {
    // 🎨 Colores (formato HEX como CSS)
    colores: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      textDark: '#7e7575', // Mantenemos el gris oscuro para bordes/títulos
      textLight: '#636e72',
      background: '#f8f9fa', // FONDO GRIS CLARO PARA CAJAS
      backgroundAlt: '#fff9f0',
      white: '#ffffff',
      border: '#dcdcdc',
      negroPuro: '#000000', // NEGRO para texto
    },

    // 📏 Tamaños
    tamaños: {
      headerHeight: 42,
      footerHeight: 20,
      logoWidth: 32,
      logoHeight: 32,
      bordeRedondeado: 3,
      // ESPACIADO ENTRE TÍTULO Y ESLOGAN - MUY CERCA
      espaciadoTituloEslogan: 2, // Muy reducido para estar pegado
    },

    // 📝 Fuentes CON CONTROL DE GROSOR - CON TIPOS ESPECÍFICOS
    fuentes: {
      tituloGrande: { size: 26, weight: 'bold' as FontStyle },
      titulo: { size: 12, weight: 'bold' as FontStyle },
      subtitulo: { size: 10, weight: 'normal' as FontStyle },
      normal: { size: 9, weight: 'normal' as FontStyle },
      pequeño: { size: 8, weight: 'normal' as FontStyle },
      total: { size: 18, weight: 'bold' as FontStyle },
      tablaHeader: { size: 9, weight: 'bold' as FontStyle },
      tablaCuerpo: { size: 9, weight: 'normal' as FontStyle },

      // FUENTE ESPECIAL PARA ESLOGAN CON ESTILO MANUSCRITO
      eslogan: {
        size: 13, // Un poco más grande para destacar
        weight: 'bolditalic' as FontStyle, // Negrita cursiva para mejor efecto
      },
    },

    // 📄 Textos personalizables
    textos: {
      empresa: 'CORTIHOUSE',
      eslogan: 'Decora con estilo', // Tu eslogan
      telefono: '+593 98 994 5145',
      email: 'cortihouse.ecu@gmail.com',
      direccion:
        'Urbanización Villas del Rey, Etapa Rey Carlos, Mz. 6, Villa 27, Guayaquil, Ecuador',
      whatsapp: '+593 98 765 4321',
      emailInfo: 'cortihouse.ecu@gmail.com',
      redesSociales: '@CortiHouse.ec',
    },

    // 🖼️ Logo
    logo: {
      url: 'https://i.postimg.cc/59GRV5hG/Whats-App-Image-2025-12-28-at-2-49-08-AM-removebg-preview.png',
      posX: 15,
      posY: 6,
    },
  };

  // ═══════════════════════════════════════════
  // 🔧 HELPER: Convierte HEX a RGB
  // ═══════════════════════════════════════════
  const hex2rgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  // 🔧 HELPER: Aplica configuración de fuente
  const aplicarFuente = (tipo: keyof typeof CONFIG.fuentes) => {
    const fuente = CONFIG.fuentes[tipo];
    doc.setFontSize(fuente.size);
    doc.setFont('helvetica', fuente.weight);
  };

  // Convertir todos los colores
  const COLORES = {
    naranjaOscuro: hex2rgb(CONFIG.colores.primary),
    naranjaClaro: hex2rgb(CONFIG.colores.secondary),
    grisOscuro: hex2rgb(CONFIG.colores.textDark), // Para bordes y títulos de sección
    negroPuro: hex2rgb(CONFIG.colores.negroPuro), // NEGRO PURO para texto
    grisClaro: hex2rgb(CONFIG.colores.background), // FONDO GRIS CLARO para cajas
    grisTexto: hex2rgb(CONFIG.colores.textLight), // Para texto secundario
    fondoAlt: hex2rgb(CONFIG.colores.backgroundAlt),
    blanco: hex2rgb(CONFIG.colores.white),
    borde: hex2rgb(CONFIG.colores.border),
  };

  // ═══════════════════════════════════════════
  // 📋 ENCABEZADO CON ESLOGAN MEJORADO
  // ═══════════════════════════════════════════
  // Fondo naranja completo
  doc.setFillColor(...COLORES.naranjaOscuro);
  doc.rect(0, 0, 210, CONFIG.tamaños.headerHeight, 'F');

  // Detalle decorativo
  doc.setFillColor(...COLORES.naranjaClaro);
  doc.triangle(140, 0, 210, 0, 210, 28, 'F');

  // LOGO
  try {
    doc.addImage(
      CONFIG.logo.url,
      'PNG',
      CONFIG.logo.posX,
      CONFIG.logo.posY,
      CONFIG.tamaños.logoWidth,
      CONFIG.tamaños.logoHeight
    );
  } catch (error) {
    // Placeholder si falla el logo
    doc.setFillColor(...COLORES.blanco);
    doc.roundedRect(15, 10, 32, 25, 2, 2, 'F');
    doc.setTextColor(...COLORES.naranjaOscuro);
    doc.setFontSize(10);
    doc.text('LOGO', 31, 24, { align: 'center' });
  }

  // Título empresa - CON GROSOR BOLD
  doc.setTextColor(...COLORES.blanco);
  aplicarFuente('tituloGrande');
  doc.text(CONFIG.textos.empresa, 52, 17);

  // ═══════════════════════════════════════════
  // ESLOGAN CON ESTILO MANUSCRITO MEJORADO
  // ═══════════════════════════════════════════
  // Usamos negrita cursiva y un tamaño especial para simular manuscrito elegante
  doc.setFontSize(CONFIG.fuentes.eslogan.size);
  doc.setFont('helvetica', CONFIG.fuentes.eslogan.weight); // bolditalic

  // Calculamos la posición para que esté JUSTO debajo del título
  // Posición Y: 17 (título) + 2 (espacio mínimo) = 19;
  const posicionYEslogan = 19.5 + CONFIG.tamaños.espaciadoTituloEslogan;

  // También podemos añadir un pequeño desplazamiento horizontal para efecto manuscrito
  const posicionXEslogan = 52; // Misma alineación que el título

  doc.text(CONFIG.textos.eslogan, posicionXEslogan, posicionYEslogan);

  // ═══════════════════════════════════════════
  // LÍNEA DECORATIVA BAJO EL ESLOGAN (opcional, para efecto elegante)
  // ═══════════════════════════════════════════
  doc.setDrawColor(...COLORES.blanco);
  doc.setLineWidth(0.3);

  // Contacto - POSICIÓN AJUSTADA
  aplicarFuente('normal'); // NORMAL
  doc.text(`Tel: ${CONFIG.textos.telefono}`, 52, 27); // Ajustado para dar espacio
  doc.text(`Email: ${CONFIG.textos.email}`, 52, 32);

  // Cuadro de PROFORMA (mantiene el gris oscuro)
  doc.setFillColor(...COLORES.grisOscuro);
  doc.roundedRect(155, 10, 40, 24, 2, 2, 'F');

  doc.setTextColor(...COLORES.blanco);
  aplicarFuente('subtitulo'); // "PROFORMA" - NORMAL
  doc.text('PROFORMA', 175, 16, { align: 'center' });

  aplicarFuente('titulo'); // Número de proforma - BOLD
  doc.text(proforma.numeroProforma, 175, 23, { align: 'center' });

  aplicarFuente('pequeño'); // Fecha - NORMAL
  const fecha = new Date(proforma.fecha);
  doc.text('Fecha: ' + fecha.toLocaleDateString('es-EC'), 175, 29, { align: 'center' });

  let y = 52;

  // ═══════════════════════════════════════════
  // 👤 DATOS DEL CLIENTE - TEXTO NEGRO, FONDO GRIS CLARO
  // ═══════════════════════════════════════════
  // Título - CON GROSOR BOLD (gris oscuro)
  doc.setFillColor(...COLORES.grisOscuro);
  doc.rect(15, y, 180, 9, 'F');
  doc.setTextColor(...COLORES.blanco);
  aplicarFuente('titulo'); // BOLD
  doc.text('Datos del Cliente', 20, y + 6);

  y += 9;

  // Contenido - TEXTO NEGRO, FONDO GRIS CLARO
  doc.setFillColor(...COLORES.grisClaro); // FONDO GRIS CLARO
  doc.rect(15, y, 180, 28, 'F');

  doc.setTextColor(...COLORES.negroPuro); // TEXTO NEGRO
  aplicarFuente('normal'); // NORMAL

  if (proforma.cliente) {
    // Columna izquierda
    doc.text('CLIENTE:', 20, y + 7);
    doc.text(proforma.cliente.nombre || 'N/A', 45, y + 7);

    if (proforma.cliente.ruc) {
      doc.text('RUC/CI:', 20, y + 13);
      doc.text(proforma.cliente.ruc, 45, y + 13);
    }

    if (proforma.cliente.direccion) {
      doc.text('DIRECCION:', 20, y + 19);
      const direccionSplit = doc.splitTextToSize(proforma.cliente.direccion, 60);
      doc.text(direccionSplit, 45, y + 19);
    }

    // Columna derecha
    if (proforma.cliente.celular) {
      doc.text('CELULAR:', 125, y + 7);
      doc.text(proforma.cliente.celular, 150, y + 7);
    }

    if (proforma.cliente.email) {
      doc.text('EMAIL:', 125, y + 13);
      doc.text(proforma.cliente.email, 150, y + 13);
    }
  } else {
    doc.setTextColor(...COLORES.grisTexto);
    doc.text('Sin datos del cliente registrados', 20, y + 15);
  }

  y += 33;

  // ═══════════════════════════════════════════
  // 📦 DETALLE DE PRODUCTOS Y SERVICIOS
  // ═══════════════════════════════════════════
  doc.setFillColor(...COLORES.grisOscuro);
  doc.rect(15, y, 180, 9, 'F');
  doc.setTextColor(...COLORES.blanco);
  aplicarFuente('titulo'); // BOLD
  doc.text('Detalle de Productos y Servicios', 20, y + 6);

  y += 11;

  // Preparar datos de la tabla
  const tableData: any[] = [];
  let itemNumber = 0;

  proforma.items.forEach((item) => {
    itemNumber++;

    const areaCortina = item.ancho * item.alto;
    const costoCortina = areaCortina * item.cortina.precioM2 * item.cantidad;

    tableData.push([
      itemNumber.toString(),
      item.cortina.codigoBase,
      item.cortina.nombre,
      `${item.ancho} x ${item.alto} m`,
      item.cantidad.toString(),
      `$${item.cortina.precioM2.toFixed(2)}`,
      `$${costoCortina.toFixed(2)}`,
    ]);

    if (item.accesoriosSeleccionados?.length) {
      item.accesoriosSeleccionados.forEach((acc) => {
        const totalAccesorio = acc.precio * acc.cantidad;
        tableData.push([
          '',
          acc.codigo,
          `  ${acc.nombre}`,
          '—',
          acc.cantidad.toString(),
          `$${acc.precio.toFixed(2)}`,
          `$${totalAccesorio.toFixed(2)}`,
        ]);
      });
    }
  });

  // Generar tabla CON TEXTO NEGRO Y FONDOS GRISES
  autoTable(doc, {
    startY: y,
    head: [['#', 'Codigo', 'Descripcion', 'Medidas', 'Cant.', 'P.Unit.', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORES.naranjaOscuro, // Header naranja
      textColor: COLORES.blanco,
      fontStyle: CONFIG.fuentes.tablaHeader.weight, // BOLD
      halign: 'center',
      fontSize: CONFIG.fuentes.tablaHeader.size,
      cellPadding: 3,
    },
    styles: {
      fontSize: CONFIG.fuentes.tablaCuerpo.size,
      fontStyle: CONFIG.fuentes.tablaCuerpo.weight, // NORMAL
      cellPadding: 3,
      textColor: COLORES.negroPuro, // TEXTO NEGRO
      lineColor: COLORES.borde,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10, fontStyle: 'bold' }, // # - BOLD
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 68 },
      3: { halign: 'center', cellWidth: 24 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', fontStyle: 'bold', cellWidth: 27 }, // Total - BOLD
    },
    alternateRowStyles: {
      fillColor: COLORES.grisClaro, // FILAS ALTERNAS GRIS CLARO
    },
    didParseCell: (data) => {
      if (data.row.index > 0 && Array.isArray(data.row.raw)) {
        if (data.row.raw[0] === '') {
          data.cell.styles.fillColor = COLORES.fondoAlt; // Fondo naranja claro para accesorios
          data.cell.styles.textColor = COLORES.grisTexto; // Texto gris para accesorios
          data.cell.styles.fontStyle = 'italic';
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ═══════════════════════════════════════════
  // 📝 OBSERVACIONES (si existen) - TEXTO NEGRO, FONDO NARANJA CLARO
  // ═══════════════════════════════════════════
  if (proforma.observacionesGenerales) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    const splitDescripcion = doc.splitTextToSize(proforma.observacionesGenerales, 170);
    const descripcionHeight = Math.max(25, splitDescripcion.length * 4.5 + 12);

    // Fondo naranja claro (fondoAlt)
    doc.setFillColor(...COLORES.fondoAlt);
    doc.roundedRect(
      15,
      y,
      180,
      descripcionHeight,
      CONFIG.tamaños.bordeRedondeado,
      CONFIG.tamaños.bordeRedondeado,
      'F'
    );

    // Borde naranja claro
    doc.setDrawColor(...COLORES.naranjaClaro);
    doc.setLineWidth(0.8);
    doc.roundedRect(
      15,
      y,
      180,
      descripcionHeight,
      CONFIG.tamaños.bordeRedondeado,
      CONFIG.tamaños.bordeRedondeado,
      'D'
    );

    // Título - CON GROSOR NORMAL
    aplicarFuente('subtitulo'); // NORMAL
    doc.setTextColor(...COLORES.naranjaOscuro); // Título en naranja oscuro
    doc.text('DESCRIPCION GENERAL:', 20, y + 7);

    // Contenido - CON GROSOR NORMAL Y TEXTO NEGRO
    aplicarFuente('normal'); // NORMAL
    doc.setTextColor(...COLORES.grisTexto); // TEXTO NEGRO
    doc.text(splitDescripcion, 20, y + 13);

    y += descripcionHeight + 8;
  }

  // ═══════════════════════════════════════════
  // 💰 TOTAL GENERAL - CAJA GRIS OSCURO COMO ANTES
  // ═══════════════════════════════════════════
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Caja del total - GRIS OSCURO
  doc.setFillColor(...COLORES.grisOscuro);
  doc.roundedRect(
    125,
    y,
    70,
    20,
    CONFIG.tamaños.bordeRedondeado,
    CONFIG.tamaños.bordeRedondeado,
    'F'
  );

  // Círculo decorativo
  doc.setFillColor(...COLORES.naranjaClaro);
  doc.circle(192, y + 3, 7, 'F');

  // Texto "TOTAL GENERAL:" - GROSOR NORMAL
  aplicarFuente('subtitulo'); // NORMAL
  doc.setTextColor(...COLORES.blanco);
  doc.text('TOTAL GENERAL:', 130, y + 9);

  // Valor del total - GROSOR BOLD
  aplicarFuente('total'); // BOLD
  doc.text(`$${proforma.totalGeneral.toFixed(2)}`, 188, y + 16, { align: 'right' });

  // ═══════════════════════════════════════════
  // 📱 PIE DE PÁGINA CON ESLOGAN CONSISTENTE
  // ═══════════════════════════════════════════
  const pageHeight = 297;
  const footerY = pageHeight - CONFIG.tamaños.footerHeight;

  // Fondo naranja oscuro
  doc.setFillColor(...COLORES.naranjaOscuro);
  doc.rect(0, footerY, 210, CONFIG.tamaños.footerHeight, 'F');

  // Detalle decorativo naranja claro
  doc.setFillColor(...COLORES.naranjaClaro);
  doc.triangle(0, footerY, 75, footerY, 0, pageHeight, 'F');

  // Línea divisoria
  doc.setDrawColor(...COLORES.blanco);
  doc.setLineWidth(0.2);
  doc.line(10, footerY + 1.5, 200, footerY + 1.5);

  // Textos del footer
  doc.setTextColor(...COLORES.blanco);

  // Línea 1: Empresa + Eslogan - MISMO ESTILO MANUSCRITO
  doc.setFontSize(CONFIG.fuentes.eslogan.size - 2); // Un poco más pequeño en footer
  doc.setFont('helvetica', CONFIG.fuentes.eslogan.weight); // bolditalic
  doc.text(`${CONFIG.textos.empresa} - ${CONFIG.textos.eslogan}`, 105, footerY + 6, {
    align: 'center',
  });

  // Línea 2: Dirección - GROSOR NORMAL
  aplicarFuente('pequeño'); // NORMAL
  doc.text(`Direccion: ${CONFIG.textos.direccion}`, 105, footerY + 11, { align: 'center' });

  // Línea 3: Contactos - GROSOR NORMAL
  doc.text(
    `WhatsApp: ${CONFIG.textos.whatsapp} | Email: ${CONFIG.textos.emailInfo}`,
    105,
    footerY + 15,
    { align: 'center' }
  );

  // Línea 4: Redes sociales - GROSOR NORMAL
  doc.text(`Facebook & Instagram: ${CONFIG.textos.redesSociales}`, 105, footerY + 18.5, {
    align: 'center',
  });

  // ═══════════════════════════════════════════
  // 💾 GUARDAR PDF
  // ═══════════════════════════════════════════
  const nombreArchivo = `Proforma_${proforma.numeroProforma}_${
    proforma.cliente?.nombre?.replace(/\s+/g, '_') || 'Cliente'
  }.pdf`;

  doc.save(nombreArchivo);
}
