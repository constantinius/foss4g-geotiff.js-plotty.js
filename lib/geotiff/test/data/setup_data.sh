wget https://github.com/EOxServer/autotest/raw/f8d9f4bde6686abbda09c711d4bf5239f5378aa9/autotest/data/meris/MER_FRS_1P_reduced/ENVISAT-MER_FRS_1PNPDE20060816_090929_000001972050_00222_23322_0058_uint16_reduced_compressed.tif -O initial.tiff
wget https://github.com/EOxServer/autotest/raw/f8d9f4bde6686abbda09c711d4bf5239f5378aa9/autotest/data/meris/mosaic_MER_FRS_1P_RGB_reduced/mosaic_ENVISAT-MER_FRS_1PNPDE20060816_090929_000001972050_00222_23322_0058_RGB_reduced.tif -O rgb.tiff
gdal_translate -of GTiff initial.tiff stripped.tiff
gdal_translate -of GTiff -co TILED=YES -co BLOCKXSIZE=32 -co BLOCKYSIZE=32 stripped.tiff tiled.tiff
gdal_translate -of GTiff -ot Int32 stripped.tiff int32.tiff
gdal_translate -of GTiff -ot UInt32 stripped.tiff uint32.tiff
gdal_translate -of GTiff -ot Float32 stripped.tiff float32.tiff
gdal_translate -of GTiff -ot Float64 stripped.tiff float64.tiff
gdal_translate -of GTiff -co COMPRESS=LZW stripped.tiff lzw.tiff
gdal_translate -of GTiff -co COMPRESS=DEFLATE stripped.tiff deflate.tiff
gdal_translate -of GTiff -co COMPRESS=PACKBITS stripped.tiff packbits.tiff
gdal_translate -of GTiff -co INTERLEAVE=BAND stripped.tiff interleave.tiff
gdal_translate -of GTiff -co TILED=YES -co BLOCKXSIZE=32 -co BLOCKYSIZE=32 -co INTERLEAVE=BAND stripped.tiff tiledplanar.tiff
gdal_translate -of GTiff -outsize 10% 10% stripped.tiff small.tiff

# overviews
cp stripped.tiff overviews.tiff
gdaladdo overviews.tiff 2 4 8 16