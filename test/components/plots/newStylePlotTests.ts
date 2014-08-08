///<reference path="../../testReference.ts" />

var assert = chai.assert;
describe("Plots", () => {
  describe("New Style Plots", () => {
    var p: Plottable.Abstract.NewStylePlot;

    beforeEach(() => {
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      p = new Plottable.Abstract.NewStylePlot(xScale, yScale);
      p.getDrawer = (k: string) => new Plottable.Drawer.RectDrawer(k);
    });

    it("Datasets can be added and removed as expected", () => {
      p.addDataset("foo", [1,2,3]);
      var d2 = new Plottable.DataSource([4,5,6]);
      p.addDataset("bar", d2);
      p.addDataset([7,8,9]);
      var d4 = new Plottable.DataSource([10,11,12]);
      p.addDataset(d4);

      assert.deepEqual(p._datasetKeysInOrder, ["foo", "bar", "_0", "_1"], "dataset keys as expected");
      var datasets = p._getDatasetsInOrder();
      assert.deepEqual(datasets[0].data(), [1,2,3]);
      assert.equal(datasets[1], d2);
      assert.deepEqual(datasets[2].data(), [7,8,9]);
      assert.equal(datasets[3], d4);

      p.removeDataset("foo");
      p.removeDataset("_0");

      assert.deepEqual(p._datasetKeysInOrder, ["bar", "_1"]);
      assert.lengthOf(p._getDatasetsInOrder(), 2);
    });

    it("Datasets are listened to appropriately", () => {
      var callbackCounter = 0;
      var callback = () => callbackCounter++;
      p._onDataSourceUpdate = callback;
      var d = new Plottable.DataSource([1,2,3]);
      p.addDataset("foo", d);
      assert.equal(callbackCounter, 1, "adding dataset triggers listener");
      d.data([1,2,3,4]);
      assert.equal(callbackCounter, 2, "modifying data triggers listener");
      p.removeDataset("foo");
      assert.equal(callbackCounter, 3, "removing dataset triggers listener");


    });
  });
});
