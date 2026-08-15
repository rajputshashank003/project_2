-- Convert empty strings to NULL in donations table so UNIQUE(certificate_number) does not collide on multiple unapproved rows
UPDATE donations SET certificate_number = NULL WHERE certificate_number = '';
UPDATE donations SET certificate_url = NULL WHERE certificate_url = '';
UPDATE donations SET rejection_reason = NULL WHERE rejection_reason = '';
UPDATE donations SET utr_number = NULL WHERE utr_number = '';
UPDATE donations SET reviewed_by = NULL WHERE reviewed_by = '';

-- Convert empty strings to NULL in id_cards table so UNIQUE(unique_card_number) does not collide on multiple unapproved rows
UPDATE id_cards SET unique_card_number = NULL WHERE unique_card_number = '';
UPDATE id_cards SET rejection_reason = NULL WHERE rejection_reason = '';
UPDATE id_cards SET reviewed_by = NULL WHERE reviewed_by = '';
