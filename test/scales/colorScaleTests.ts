///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Color Scale", () => {

    describe("Basic Usage", () => {
      let defaultColors = [
        "#5279c7", "#fd373e", "#63c261", "#fad419", "#2c2b6f",
        "#ff7939", "#db2e65", "#99ce50", "#962565", "#06cccc"
      ];

      it("default colors are generated", () => {
        let scale = new Plottable.Scales.Color();
        assert.deepEqual(scale.range(), defaultColors, "The color scale uses the default colors by default");
      });

      it("uses altered colors if size of domain exceeds size of range", () => {
        let scale = new Plottable.Scales.Color();
        let colorRange = ["#5279c7", "#fd373e"];
        scale.range(colorRange);
        scale.domain(["a", "b", "c"]);
        assert.strictEqual(scale.scale("a"), colorRange[0], "first color is used");
        assert.strictEqual(scale.scale("b"), colorRange[1], "second color is used");
        assert.notStrictEqual(scale.scale("c"), colorRange[0], "first color is slightly modified and used");
      });

      it("interprets named color values correctly", () => {
        let scale = new Plottable.Scales.Color();
        scale.range(["red", "blue"]);
        scale.domain(["a", "b"]);
        assert.strictEqual(scale.scale("a"), "#ff0000", "red color as string should be correctly identified");
        assert.strictEqual(scale.scale("b"), "#0000ff", "blue color as string should be correctly identified");
      });

      it("accepts Category domain", () => {
        let scale = new Plottable.Scales.Color();
        scale.domain(["yes", "no", "maybe"]);
        assert.strictEqual(scale.scale("yes"), defaultColors[0], "first color used for first option");
        assert.strictEqual(scale.scale("no"), defaultColors[1], "second color used for second option");
        assert.strictEqual(scale.scale("maybe"), defaultColors[2], "third color used for third option");
      });

      it("accepts categorical string types and Category domain", () => {
        let scale = new Plottable.Scales.Color("10");
        scale.domain(["yes", "no", "maybe"]);
        assert.strictEqual(scale.scale("yes"), "#1f77b4", "D3 Scale 10 color 1 used for option 1");
        assert.strictEqual(scale.scale("no"), "#ff7f0e", "D3 Scale 10 color 2 used for option 2");
        assert.strictEqual(scale.scale("maybe"), "#2ca02c", "D3 Scale 10 color 3 used for option 3");
      });

      it("accepts CSS specified colors", () => {
        let style = d3.select("body").append("style");
        style.html(".plottable-colors-0 {background-color: #ff0000 !important; }");

        Plottable.Scales.Color.invalidateColorCache();
        let scale = new Plottable.Scales.Color();
        assert.strictEqual(scale.range()[0], "#ff0000", "User has specified red color for first color scale color");
        assert.strictEqual(scale.range()[1], defaultColors[1], "The second color of the color scale should be the same");

        style.remove();
        Plottable.Scales.Color.invalidateColorCache();

        let defaultScale = new Plottable.Scales.Color();
        assert.strictEqual(scale.range()[0], "#ff0000",
          "Unloading the CSS should not modify the first scale color (this will not be the case if we support dynamic CSS");
        assert.strictEqual(defaultScale.range()[0], "#5279c7",
          "Unloading the CSS should cause color scales fallback to default colors");
      });

       it("caches CSS specified colors unless the cache is invalidated", () => {
        let style = d3.select("body").append("style");
        style.html(".plottable-colors-0 {background-color: #ff0000 !important; }");
        Plottable.Scales.Color.invalidateColorCache();
        let scale = new Plottable.Scales.Color();
        style.remove();

        assert.strictEqual(scale.range()[0], "#ff0000", "User has specified red color for first color scale color");

        let scaleCached = new Plottable.Scales.Color();
        assert.strictEqual(scaleCached.range()[0], "#ff0000", "The red color should still be cached");

        Plottable.Scales.Color.invalidateColorCache();
        let scaleFresh = new Plottable.Scales.Color();
        assert.strictEqual(scaleFresh.range()[0], "#5279c7", "Invalidating the cache should reset the red color to the default");
      });

      it("should try to recover from malicious CSS styleseets", () => {
        let defaultNumberOfColors = 10;

        let initialScale = new Plottable.Scales.Color();
        assert.strictEqual(initialScale.range().length, defaultNumberOfColors,
          "there should initially be " + defaultNumberOfColors + " default colors");

        let maliciousStyle = d3.select("body").append("style");
        maliciousStyle.html("* {background-color: #fff000;}");
        Plottable.Scales.Color.invalidateColorCache();
        let affectedScale = new Plottable.Scales.Color();
        maliciousStyle.remove();
        Plottable.Scales.Color.invalidateColorCache();
        let colorRange = affectedScale.range();
        assert.strictEqual(colorRange.length, defaultNumberOfColors + 1,
          "it should detect the end of the given colors and the fallback to the * selector, " +
          "but should still include the last occurance of the * selector color");

        assert.strictEqual(colorRange[colorRange.length - 1], "#fff000",
          "the * selector background color should be added at least once at the end");

        assert.notStrictEqual(colorRange[colorRange.length - 2], "#fff000",
          "the * selector background color should be added at most once at the end");
      });

      it("does not crash by malicious CSS stylesheets", () => {
        let initialScale = new Plottable.Scales.Color();
        assert.strictEqual(initialScale.range().length, 10, "there should initially be 10 default colors");

        let maliciousStyle = d3.select("body").append("style");
        maliciousStyle.html("[class^='plottable-'] {background-color: pink;}");
        Plottable.Scales.Color.invalidateColorCache();
        let affectedScale = new Plottable.Scales.Color();
        maliciousStyle.remove();
        Plottable.Scales.Color.invalidateColorCache();
        let maximumColorsFromCss = (<any> Plottable.Scales.Color)._MAXIMUM_COLORS_FROM_CSS;
        assert.strictEqual(affectedScale.range().length, maximumColorsFromCss,
          "current malicious CSS countermeasure is to cap maximum number of colors to 256");
      });

    });
  });
});
