gsutil -m cp -r gs://arium-builder-example.appspot.com/standardAssets ../exports/storage

gsutil -m cp -r gs://arium-builder-example.appspot.com/spaceAssets/empty  ../exports/storage/spaceAssets
gsutil -m cp -r gs://arium-builder-example.appspot.com/spaceAssets/marble-theater  ../exports/storage/spaceAssets

gsutil -m cp -r gs://arium-builder-example.appspot.com/dbExports ../exports/