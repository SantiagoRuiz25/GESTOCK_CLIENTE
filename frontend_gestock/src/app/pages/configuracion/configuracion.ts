import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConfiguracionGestock {
  notificacionesEmail: boolean;
  resumenSemanal: boolean;
  seguridadActiva: boolean;
  dosFactores: boolean;
  tiempoSesion: number;
  expiracionPassword: number;
  copiasSeguridad: boolean;
  backupAutomatico: boolean;
  frecuenciaBackup: 'diario' | 'semanal' | 'mensual' | 'anual';
}

export interface OpcionesExportacion {
  formato: 'json' | 'csv' | 'pdf';
  incluirNotificaciones: boolean;
  incluirSeguridad: boolean;
  incluirBackup: boolean;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent {
  tabActiva: 'notificaciones' | 'seguridad' | 'backup' = 'seguridad';
  
  // Control del Modal de Guardado
  mostrarModalGuardar: boolean = false;
  guardadoExitoso: boolean = false;

  // Control del Modal de Exportación
  mostrarModalExportar: boolean = false;

  // Control del Estado de Backup Manual
  cargandoBackup: boolean = false;
  mostrarModalBackupExitoso: boolean = false;
  ultimoBackupFecha: string | null = null;

  opcionesExportar: OpcionesExportacion = {
    formato: 'json',
    incluirNotificaciones: true,
    incluirSeguridad: true,
    incluirBackup: true
  };

  config: ConfiguracionGestock = {
    notificacionesEmail: true,
    resumenSemanal: false,
    seguridadActiva: true,
    dosFactores: true,
    tiempoSesion: 30,
    expiracionPassword: 90,
    copiasSeguridad: true,
    backupAutomatico: true,
    frecuenciaBackup: 'diario'
  };

  cambiarTab(tab: 'notificaciones' | 'seguridad' | 'backup'): void {
    this.tabActiva = tab;
  }

  // --- MÉTODOS MODAL GUARDAR ---
  abrirModalGuardar(): void {
    this.guardadoExitoso = false;
    this.mostrarModalGuardar = true;
  }

  cerrarModalGuardar(): void {
    this.mostrarModalGuardar = false;
    this.guardadoExitoso = false;
  }

  confirmarGuardado(): void {
    this.guardadoExitoso = true;
  }

  finalizarGuardado(): void {
    console.log('Configuración guardada exitosamente:', this.config);
    this.cerrarModalGuardar();
  }

  // --- MÉTODOS DE BACKUP MANUAL ---
  ejecutarBackupManual(): void {
    this.cargandoBackup = true;

    // Simulamos un tiempo de procesamiento para simular la descarga/respuesta
    setTimeout(() => {
      const datosBackup = {
        sistema: 'GESTOCK',
        version: '1.0.0',
        fecha_creacion: new Date().toISOString(),
        tipo: 'backup_manual',
        configuraciones: this.config
      };

      const fechaStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(datosBackup, null, 2));

      this.dispararDescarga(dataStr, `gestock_backup_manual_${fechaStr}.json`);

      this.cargandoBackup = false;
      this.ultimoBackupFecha = new Date().toLocaleTimeString();
      this.mostrarModalBackupExitoso = true;
    }, 1800);
  }

  cerrarModalBackup(): void {
    this.mostrarModalBackupExitoso = false;
  }

  // --- MÉTODOS DE EXPORTACIÓN ---
  exportarConfiguracion(): void {
    this.mostrarModalExportar = true;
  }

  cerrarModalExportar(): void {
    this.mostrarModalExportar = false;
  }

  descargarArchivoConfiguracion(): void {
    const payloadExportacion: Record<string, string | number | boolean> = {};

    if (this.opcionesExportar.incluirNotificaciones) {
      payloadExportacion['Notificaciones por Email'] = this.config.notificacionesEmail ? 'Activado' : 'Desactivado';
      payloadExportacion['Resumen Semanal'] = this.config.resumenSemanal ? 'Activado' : 'Desactivado';
    }

    if (this.opcionesExportar.incluirSeguridad) {
      payloadExportacion['Seguridad Activa'] = this.config.seguridadActiva ? 'Activado' : 'Desactivado';
      payloadExportacion['Autenticación en Dos Pasos (2FA)'] = this.config.dosFactores ? 'Activado' : 'Desactivado';
      payloadExportacion['Tiempo de Sesión (min)'] = this.config.tiempoSesion;
      payloadExportacion['Expiración Contraseña (días)'] = this.config.expiracionPassword;
    }

    if (this.opcionesExportar.incluirBackup) {
      payloadExportacion['Copias de Seguridad'] = this.config.copiasSeguridad ? 'Activado' : 'Desactivado';
      payloadExportacion['Backup Automático'] = this.config.backupAutomatico ? 'Activado' : 'Desactivado';
      payloadExportacion['Frecuencia de Backup'] = this.config.frecuenciaBackup;
    }

    const fecha = new Date().toISOString().slice(0, 10);

    // 1. Exportar JSON
    if (this.opcionesExportar.formato === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payloadExportacion, null, 2));
      this.dispararDescarga(dataStr, `gestock_config_${fecha}.json`);
    } 

    // 2. Exportar CSV
    else if (this.opcionesExportar.formato === 'csv') {
      let contenidoCsv = 'Parametro,Valor\n';
      Object.entries(payloadExportacion).forEach(([clave, valor]) => {
        contenidoCsv += `"${clave}","${valor}"\n`;
      });

      const blob = new Blob(['\ufeff' + contenidoCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      this.dispararDescarga(url, `gestock_config_${fecha}.csv`);
      URL.revokeObjectURL(url);
    } 

    // 3. Exportar PDF
    else if (this.opcionesExportar.formato === 'pdf') {
      this.generarPdfImpresion(payloadExportacion, fecha);
    }

    this.cerrarModalExportar();
  }

  private dispararDescarga(uri: string, nombreArchivo: string): void {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', uri);
    anchor.setAttribute('download', nombreArchivo);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  private generarPdfImpresion(datos: Record<string, string | number | boolean>, fecha: string): void {
    const ventana = window.open('', '_blank');
    if (!ventana) return;

    let filasHtml = '';
    Object.entries(datos).forEach(([campo, valor]) => {
      filasHtml += `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155;">${campo}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${valor}</td>
        </tr>`;
    });

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Gestock - Exportación de Configuración</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
            h1 { color: #1e40af; margin: 0 0 5px 0; font-size: 24px; }
            p { color: #64748b; margin: 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f1f5f9; text-align: left; padding: 12px; font-size: 14px; border-bottom: 2px solid #cbd5e1; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GESTOCK - Reporte de Configuración</h1>
            <p>Fecha de emisión: ${fecha}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Parámetro</th>
                <th>Valor Actual</th>
              </tr>
            </thead>
            <tbody>
              ${filasHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  }
}