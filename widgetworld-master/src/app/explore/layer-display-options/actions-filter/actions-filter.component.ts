
import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import { LayersService } from '../layers.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { LoaderService } from '../../../shared/services/loader.service';
import * as html2canvas from '../../../../assets/js/htmltocanvas.js';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '@shared/services';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { PrintViewPublicDialogComponent } from '@shared/components/publicSite/print-view-public-dialog/print-view-public-dialog.component';

@Component({
  selector: 'app-actions-filter',
  templateUrl: './actions-filter.component.html',
  styleUrls: ['./actions-filter.component.less']
})
export class ActionsFilterComponent implements OnInit {
  public fromAction = true;
  mod_permission: any;
  allowInventory: any = '';
  allowInventoryAudience: any = '';
  audienceLicense = {};
  themeSettings: any;
  isPublicSite: boolean;

  constructor(
    private layersService: LayersService,
    private authentication: AuthenticationService,
    private loaderService: LoaderService,
    private http: HttpClient,
    private theme: ThemeService,
    public dialog: MatDialog,

  ) { }

  ngOnInit() {
    this.fromAction = true;
    this.mod_permission = this.authentication.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.audienceLicense = this.authentication.getModuleAccess('gpAudience');
    this.themeSettings = this.theme.getThemeSettings();
    this.allowInventoryAudience = this.audienceLicense['status'];
    if (this.themeSettings.publicSite) {
      this.isPublicSite = true;
    } else {
      this.isPublicSite = false;
    }
  }

  onLoadView() {
    this.layersService.setLoadView(true);
  }

  clearView() {
    this.layersService.setApplyLayers(false);
    this.layersService.setLoadView(false);
    this.layersService.setSaveView(false);
    this.layersService.setClearView(true);
  }

  saveView() {
    this.layersService.setSaveView(true);
  }

  openDialogPrintView()
  {
    const dialogRef = this.dialog.open(PrintViewPublicDialogComponent, {
      width: '603px',
      });
  }

  public printView() {
    this.loaderService.display(true);
    const element = document.getElementById('printContent');
     html2canvas(element, {
      removeContainer: true,
      imageTimeout: 0,
      useCORS: true,
      logging: false,
      onclone: function(document) {
        document.querySelector('.mapboxgl-ctrl-top-left').style.display = 'none';
        document.querySelector('.mapboxgl-ctrl-locate-me').style.display = 'none';
        document.querySelector('.mapboxgl-ctrl-bottom-left').style.display = 'none';
        document.querySelector('.map-zoom-out').style.display = 'none';
        document.querySelector('.explore-tabular-toggle-button').style.display = 'none';
        document.querySelector('.map-zoom-out').style.display = 'none';
        document.querySelector('.map-time-stamp').style.display = 'block';
        const mapKeyLegend = document.querySelector('.map-key-legend');
        if (mapKeyLegend !== null) {
          mapKeyLegend.style.display = 'none';
        }
        const mapKeyLegendClose = document.querySelector('.legend-header i');
        if (mapKeyLegendClose !== null) {
          mapKeyLegendClose.style.display = 'none';
        }
        const keyLegends = document.querySelector('.key-legends');
        if (keyLegends != null) {
          keyLegends.classList.add('left70');
        }
      }
    })
    .then(canvas => {
     // document.body.appendChild(canvas);
      this.loaderService.display(false);
      const dataImage = canvas.toDataURL();

      const printStyle = document.getElementById('printScreen');
      const el_printBrinding = document.getElementById('printBranding');
        if (printStyle !== null) {
          printStyle.remove();
        }
        if (el_printBrinding !== null) {
          el_printBrinding.remove();
        }
        const body = document.getElementsByTagName('body')[0];
        const el = document.createElement('img');
        el.src = dataImage ;
        el.id = 'printScreen';
        el.style.display = 'none';
        el.style.marginLeft = '-18px';
        el.style.width = '100%';
        body.appendChild(el);
        const content = document.createElement('div');
        content.id = 'printBranding';
        content.style.display = 'none';
        content.innerHTML=`<hr style="margin-right: 20px;"><p style="margin-right: 20px; color: var(--high-emphasis);">Established in 1933, Geopath is a not-for-profit organization governed by a tripartite board comprised of advertisers, agencies and media companies. Geopath uses mobile location data and research methodologies to measure and analyze audience location and show how consumers engage with out-of-home advertising.</p>  <p style="display: flex;flex-direction: row;place-content: space-between;margin-top: 20px; color: var(--high-emphasis);">
        <span>To become a member or find out more information email <span  style="color:var(--blue-color);">geekout@geopath.org.</span><br> Give us a ring at 212.972.8075 or visit our website at <span style="color:var(--blue-color);">www.geopath.org</span> now.
        </span><span><img src="./assets/images/geopath_black_logo.png" alt="Geopath Help Center home page" style="height: 50px;margin-right: 10px;"></span>
        </p>`;
        body.appendChild(content);
        setTimeout(() => {
          window.print();
        }, 150);
      $('#printContent').click();
    },
    err => {
      this.loaderService.display(false);
    }
    );
  }
}
