# uncomment below when can export to it
#gcloud firestore export gs://arium-open-source.appspot.com/export --collection-ids=spaces
gcloud firestore export gs://arium-builder-example.appspot.com/export/db --collection-ids=spaces

gsutil -m cp -r gs://arium-builder-example.appspot.com/export/db gs://arium-open-source.appspot.com/export
gsutil -m cp -r gs://arium-builder-example.appspot.com/standardAssets gs://arium-open-source.appspot.com/export
gsutil -m cp -r gs://arium-builder-example.appspot.com/spaceAssets/empty gs://arium-open-source.appspot.com/export/spaceAssets
gsutil -m cp -r gs://arium-builder-example.appspot.com/spaceAssets/marble-theater gs://arium-open-source.appspot.com/export/spaceAssetss