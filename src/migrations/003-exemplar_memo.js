exports.up = async DB => {
	DB.prepare(
		`
		ALTER TABLE medienexemplar ADD COLUMN memo TEXT
  `
  ).run();
};

exports.down = async client => {
	// just in case...
};
