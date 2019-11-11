import { Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LayersService } from '../../../explore/layer-display-options/layers.service';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ThemeService } from '@shared/services';

@Component({
  selector: 'app-map-display-options',
  templateUrl: './map-display-options.component.html',
  styleUrls: ['./map-display-options.component.less'],
  // Hide this temp.
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapDisplayOptionsComponent implements OnInit, OnDestroy {
  step = 4;
  public selectedMapStyle: any = '';
  public layerDisplayOptions: any = {};
  public logoTextCtrl: FormControl = new FormControl();
  public logoBackgroundCtrl = new FormControl();
  public textBackgroundCtrl = new FormControl();
  private unSubscribe: Subject<void> = new Subject<void>();
  public fileName = '';
  public fileValidationText = '';
  private themeSettings: any;
  public baseMaps: any;
  public mapStyle: any = '';
  public isAntiquePresent;
  @ViewChild('fileInput', {static: true}) selectedFile: any;

  constructor(
    private layersService: LayersService,
    private themeService: ThemeService,
    private cdRef: ChangeDetectorRef
  ) {
    this.layerDisplayOptions = JSON.parse(JSON.stringify(this.layersService.defaultDisplayOptions));
   }

  ngOnInit() {
    this.themeSettings = this.themeService.getThemeSettings();
    this.baseMaps = this.themeSettings.basemaps;
    this.isAntiquePresent = this.baseMaps.some((maps) => maps.label === 'antique');
    let layersSession = this.layersService.getlayersSession(true);

    if (layersSession && layersSession['display'] && layersSession.display['baseMap']) {
      this.layerDisplayOptions = layersSession.display;
      this.selectedMapStyle = layersSession.display['baseMap'];
    } else {
      this.baseMaps.filter(maps => {
        if (maps.default) {
          this.mapStyle = maps.label;
          this.layerDisplayOptions.baseMap = maps.label;
        }
      });
      this.selectedMapStyle = this.mapStyle;
    }

    // if (layersSession && layersSession['display'] && layersSession.display['labels']) {
    //   this.layerDisplayOptions.labels = layersSession.display['labels'];
    // }
    this.layersService.setDisplayOptions(this.layerDisplayOptions);
    this.layersService.getApplyLayers().pipe(takeUntil(this.unSubscribe)).subscribe((value) => {
      layersSession = this.layersService.getlayersSession(true);
      if (!value) {
        this.resetAll();
      } else {
        if (layersSession && layersSession['display']) {
          this.layerDisplayOptions = layersSession.display;
          if (layersSession.display['logo'] && layersSession.display['logo']['location']) {
            // this.logoBackgroundCtrl.enable();
            this.fileName = layersSession.display['logo']['location'];
            if (typeof layersSession.display['logo']['backgroundWhite'] !== 'undefined') {
              this.logoBackgroundCtrl.patchValue(layersSession.display['logo']['backgroundWhite']);
            }
          } else if (layersSession['customLogoInfo'] && layersSession['customLogoInfo']['logo']) {
            if (layersSession['customLogoInfo']['logo']['fileName']) {
              this.fileName = layersSession['customLogoInfo']['logo']['fileName'];
            } else {
              this.layerDisplayOptions['isLogoEnabled'] = false;
            }
            if (typeof layersSession['customLogoInfo']['logo']['backgroundWhite'] !== 'undefined') {
              this.logoBackgroundCtrl.patchValue(layersSession['customLogoInfo']['logo']['backgroundWhite']);
            }
          }
          if (layersSession.display['text']) {
            this.logoTextCtrl.patchValue(layersSession.display['text']['text']);
            this.textBackgroundCtrl.patchValue(layersSession.display['text']['backgroundWhite']);
            if (layersSession.display['text']['text'] === undefined) {
              this.layerDisplayOptions['isTextEnabled'] = false;
            }
          } else {
            this.layerDisplayOptions['isTextEnabled'] = false;
          }
          this.selectedMapStyle = layersSession.display['baseMap'];
        }
      }
    });
    this.logoTextCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.unSubscribe))
      .subscribe(() => {
        this.setTextInfo({text: this.logoTextCtrl.value});
      });
    this.logoBackgroundCtrl.valueChanges
    .pipe(takeUntil(this.unSubscribe))
    .subscribe(() => {
      if (this.logoBackgroundCtrl.value) {
        this.setLogoInfo({backgroundWhite: this.logoBackgroundCtrl.value});
      } else {
        this.setLogoInfo({backgroundWhite: false});
      }
    });
    this.textBackgroundCtrl.valueChanges
    .pipe(takeUntil(this.unSubscribe))
    .subscribe(() => {
      this.setTextInfo({backgroundWhite: this.textBackgroundCtrl.value});
    });

    this.layersService.getRemoveLogoAndText()
    .pipe(takeUntil(this.unSubscribe))
    .subscribe((type) => {
      if (type === 'logo') {
        this.clearFile(true);
      } else {
        this.clearCustomText();
      }
    });
  }


  public changeMapOptions(type, event) {
    setTimeout((e) => {
      this.layerDisplayOptions[type] = event.checked;
      this.layersService.setDisplayOptions(this.layerDisplayOptions);
    }, 500);
  }


  public changeMapStyle(style) {
    this.selectedMapStyle = style;
    this.layerDisplayOptions['baseMap'] = style;
    this.layersService.setDisplayOptions(this.layerDisplayOptions);
  }

  public updateCustomText(event: string) {
    if (event.trim().length > 0) {
      this.layerDisplayOptions['isTextEnabled'] = true;
    } else {
      this.layerDisplayOptions['isTextEnabled'] = false;
    }
  }

  private setTextInfo(data) {
    if (this.layerDisplayOptions['text']) {
      for (const key of Object.keys(data)) {
        this.layerDisplayOptions['text'][key] = data[key];
      }
      this.layersService.setDisplayOptions(this.layerDisplayOptions);
    } else {
      this.layerDisplayOptions['text'] = data;
      this.layersService.setDisplayOptions(this.layerDisplayOptions);
    }
  }

  public clearFile(removeBackground = false) {
    this.layersService.customLogo = {};
    this.fileName = '';
    this.fileValidationText = '';
    this.selectedFile.nativeElement.value = '';
    if (removeBackground) {
      this.logoBackgroundCtrl.patchValue(false);
    }
    this.layerDisplayOptions['logo'] = {};
    const layerSession = this.layersService.getlayersSession(true);
    if (layerSession && layerSession['customLogoInfo']) {
      delete layerSession['customLogoInfo'];
      this.layersService.saveLayersSession(layerSession, true);
    }
    this.layerDisplayOptions['isLogoEnabled'] = false;
    this.layersService.setDisplayOptions(this.layerDisplayOptions);
  }

  public updateLogo(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      const file = event.target.files[0];
      if (['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        if (file.size < 1024 * 1024 * 2) {
          this.fileValidationText = '';
          reader.onload = (e: any) => {
            this.layersService.customLogo = {};
            const formData = new FormData();
            formData.append('attachment', event.target.files[0]);
            this.fileName = event.target.files[0].name;
            this.cdRef.markForCheck();
            this.setLogoInfo({location: formData, url: e.target.result, fileName: this.fileName});
          };
          reader.readAsDataURL(event.target.files[0]);
          this.layerDisplayOptions['isLogoEnabled'] = true;
          // this.logoBackgroundCtrl.enable();
        } else {
          this.selectedFile.nativeElement.value = '';
          this.fileValidationText = 'File size should be less than 2MB';
        }
      } else {
        this.selectedFile.nativeElement.value = '';
        this.fileValidationText = 'File format should be any of jpg/jpeg/png';
      }
    }
  }

  public addBackground(applyTo, event) {
    if (applyTo === 'logo') {
      this.setLogoInfo({backgroundWhite: event.checked});
    } else {
      this.setTextInfo({backgroundWhite: event.checked});
    }
  }

  private setLogoInfo(data) {
    if (this.layersService.customLogo['logo']) {
      for (let key of Object.keys(data)) {
        this.layersService.customLogo['logo'][key] = data[key];
      }
    } else {
      this.layersService.customLogo['logo'] = data;
    }
  }

  public clearCustomText() {
    this.textBackgroundCtrl.patchValue(false);
    this.logoTextCtrl.patchValue('');
    this.layerDisplayOptions['text'] = {};
    this.layersService.setDisplayOptions(this.layerDisplayOptions);
    this.layerDisplayOptions['isTextEnabled'] = false;
  }

  private resetAll() {
    this.selectedMapStyle = this.mapStyle;
    this.clearFile(true);
    this.clearCustomText();
    this.textBackgroundCtrl.patchValue(false);
    this.logoTextCtrl.patchValue('');
    this.layerDisplayOptions = JSON.parse(JSON.stringify(this.layersService.defaultDisplayOptions));
    this.layerDisplayOptions.baseMap = this.selectedMapStyle;
    this.layersService.customLogo = {};
    this.layersService.setDisplayOptions(this.layerDisplayOptions);
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

}
