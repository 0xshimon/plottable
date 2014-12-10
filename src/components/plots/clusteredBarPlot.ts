///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export interface ClusteredPlotMetadata extends PlotMetadata {
    position: number;
  }

  export class ClusteredBar<X,Y> extends AbstractBarPlot<X,Y> {

    /**
     * Creates a ClusteredBarPlot.
     *
     * A ClusteredBarPlot is a plot that plots several bar plots next to each
     * other. For example, when plotting life expectancy across each country,
     * you would want each country to have a "male" and "female" bar.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>, isVertical = true) {
      this._isVertical = isVertical; // Has to be set before super()
      super(xScale, yScale);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      // the width is constant, so set the inner scale range to that
      var innerScale = this._makeInnerScale();
      var innerWidthF = (d: any, i: number) => innerScale.rangeBand();
      var heightF = attrToProjector["height"];
      attrToProjector["width"] = this._isVertical ? innerWidthF : heightF;
      attrToProjector["height"] = this._isVertical ? heightF : innerWidthF;

      var xAttr = attrToProjector["x"];
      var yAttr = attrToProjector["y"];
      var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._xScale : this._yScale;
      var accessor = this._isVertical ? this._projections["x"].accessor : this._projections["y"].accessor;

      attrToProjector["x"] = (d: any, i: number, u: any, m: ClusteredPlotMetadata) =>
        this._isVertical ? primaryScale.scale(accessor(d, i, u, m)) + m.position : xAttr(d, u, u, m);
      attrToProjector["y"] = (d: any, i: number, u: any, m: ClusteredPlotMetadata) =>
        this._isVertical ? yAttr(d, i, u, m) : primaryScale.scale(accessor(d, i, u, m)) + m.position;

      return attrToProjector;
    }

    private _updateClusterPosition() {
      var innerScale = this._makeInnerScale();
      this._datasetKeysInOrder.forEach((key: string) => {
        var plotMetadata = <ClusteredPlotMetadata>this._key2PlotDatasetKey.get(key).plotMetadata;
        plotMetadata.position = innerScale.scale(key);
      });
    }

    private _makeInnerScale(){
      var innerScale = new Scale.Ordinal();
      innerScale.domain(this._datasetKeysInOrder);
      // TODO: it might be replaced with _getBarPixelWidth call after closing #1180.
      if (!this._projections["width"]) {
        var secondaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._xScale : this._yScale;
        var bandsMode = (secondaryScale instanceof Plottable.Scale.Ordinal)
                      && (<Plottable.Scale.Ordinal> <any> secondaryScale).rangeType() === "bands";
        var constantWidth = bandsMode ? (<Scale.Ordinal> <any> secondaryScale).rangeBand() : AbstractBarPlot._DEFAULT_WIDTH;
        innerScale.range([0, constantWidth]);
      } else {
        var projection = this._projections["width"];
        var accessor = projection.accessor;
        var scale = projection.scale;
        // HACKHACK Metadata should be passed
        var fn = scale ? (d: any, i: number, u: any, m: PlotMetadata) => scale.scale(accessor(d, i, u, m)) : accessor;
        innerScale.range([0, fn(null, 0, null, null)]);
      }
      return innerScale;
    }

    protected _getDataToDraw() {
      this._updateClusterPosition();
      return super._getDataToDraw();
    }

    protected _getPlotMetadataForDataset(key: string): ClusteredPlotMetadata {
      var metadata = <ClusteredPlotMetadata>super._getPlotMetadataForDataset(key);
      metadata.position = 0;
      return metadata;
    }
  }
}
}
