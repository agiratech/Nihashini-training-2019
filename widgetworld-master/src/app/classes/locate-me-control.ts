export class LocateMeControl {
  public _map;
  public _container;
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-locate-me';
    this._container.innerHTML = '<button class="mapboxgl-ctrl-icon mapboxgl-ctrl-locate" type="button" aria-label="Geolocate" aria-pressed="false" title="LO-CATE ME"></button>';
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
