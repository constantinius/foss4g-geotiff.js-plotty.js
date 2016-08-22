import sys
from osgeo import gdal

src_ds = gdal.OpenShared(sys.argv[1])

tmp_ds = gdal.GetDriverByName('MEM').CreateCopy('', src_ds, 0)
tmp_ds.AddBand()
tmp_ds.GetRasterBand(4).Fill(256)

dst_ds = src_ds.GetDriver().CreateCopy(sys.argv[2], tmp_ds, 0)
del dst_ds
