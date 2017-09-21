world-universities-csv
======================
This is a forked copy of two CSV files with universities in the US and around the world.

I have modified this to only include the University name and the .edu domain name that is associated with the university.  This is useful for identifying a college based on an email address.

## Import

Universities are imported from https://univ.cc. To run the importer, execute the following commands:

```bash
npm install importer
node importer/import.js
```

To add any universities, please submit them directly to [https://univ.cc/add.php](https://univ.cc/add.php).
