-- Create FTS5 virtual table
CREATE VIRTUAL TABLE documents_fts USING fts5(
    id UNINDEXED,
    title,
    content
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO documents_fts(id, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER documents_ad AFTER DELETE ON documents BEGIN
  DELETE FROM documents_fts WHERE id = old.id;
END;

CREATE TRIGGER documents_au AFTER UPDATE ON documents BEGIN
  DELETE FROM documents_fts WHERE id = old.id;
  INSERT INTO documents_fts(id, title, content) VALUES (new.id, new.title, new.content);
END;

-- Populate existing data
INSERT INTO documents_fts(id, title, content) SELECT id, title, content FROM documents;
