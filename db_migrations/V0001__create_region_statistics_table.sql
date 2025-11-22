CREATE TABLE region_statistics (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    rating INTEGER,
    total_objects INTEGER DEFAULT 0,
    info_provided INTEGER DEFAULT 0,
    objects_for_exclusion INTEGER DEFAULT 0,
    total_objects_forecast INTEGER DEFAULT 0,
    completion_percent NUMERIC(5, 2) DEFAULT 0,
    objects_with_valid_cameras INTEGER DEFAULT 0,
    objects_with_cameras INTEGER DEFAULT 0,
    total_cameras INTEGER DEFAULT 0,
    valid_cameras_count INTEGER DEFAULT 0,
    invalid_cameras_count INTEGER DEFAULT 0,
    cameras_percent_of_total NUMERIC(5, 2) DEFAULT 0,
    cameras_percent_of_provided NUMERIC(5, 2) DEFAULT 0,
    rtsp_count INTEGER DEFAULT 0,
    https_count INTEGER DEFAULT 0,
    http_count INTEGER DEFAULT 0,
    accounts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_region_statistics_subject ON region_statistics(subject);
CREATE INDEX idx_region_statistics_rating ON region_statistics(rating);
CREATE INDEX idx_region_statistics_completion ON region_statistics(completion_percent DESC);