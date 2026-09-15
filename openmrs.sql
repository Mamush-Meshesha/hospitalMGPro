-- Adminer 6.0.1 MariaDB 10.11.7-MariaDB-1:10.11.7+maria~ubu2204 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `address_hierarchy_address_to_entry_map`;
CREATE TABLE `address_hierarchy_address_to_entry_map` (
  `address_to_entry_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `address_id` int(11) NOT NULL,
  `entry_id` int(11) NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`address_to_entry_map_id`),
  KEY `address_id_to_person_address_table` (`address_id`),
  KEY `entry_id_to_address_hierarchy_table` (`entry_id`),
  CONSTRAINT `address_id_to_person_address_table` FOREIGN KEY (`address_id`) REFERENCES `person_address` (`person_address_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `entry_id_to_address_hierarchy_table` FOREIGN KEY (`entry_id`) REFERENCES `address_hierarchy_entry` (`address_hierarchy_entry_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `address_hierarchy_entry`;
CREATE TABLE `address_hierarchy_entry` (
  `address_hierarchy_entry_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(160) DEFAULT NULL,
  `level_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `user_generated_id` varchar(11) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `elevation` double DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`address_hierarchy_entry_id`),
  KEY `address_hierarchy_entry_name_idx` (`name`),
  KEY `level_name` (`level_id`,`name`),
  KEY `parent_name` (`parent_id`,`name`),
  CONSTRAINT `level_to_level` FOREIGN KEY (`level_id`) REFERENCES `address_hierarchy_level` (`address_hierarchy_level_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `parent-to-parent` FOREIGN KEY (`parent_id`) REFERENCES `address_hierarchy_entry` (`address_hierarchy_entry_id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `address_hierarchy_level`;
CREATE TABLE `address_hierarchy_level` (
  `address_hierarchy_level_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(160) DEFAULT NULL,
  `parent_level_id` int(11) DEFAULT NULL,
  `address_field` varchar(50) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`address_hierarchy_level_id`),
  UNIQUE KEY `parent_level_id` (`parent_level_id`),
  KEY `address_field_unique` (`address_field`),
  CONSTRAINT `parent_level` FOREIGN KEY (`parent_level_id`) REFERENCES `address_hierarchy_level` (`address_hierarchy_level_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `allergy`;
CREATE TABLE `allergy` (
  `allergy_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `severity_concept_id` int(11) DEFAULT NULL,
  `coded_allergen` int(11) NOT NULL,
  `non_coded_allergen` varchar(255) DEFAULT NULL,
  `allergen_type` varchar(50) NOT NULL,
  `comments` varchar(1024) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 1,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) DEFAULT NULL,
  `form_namespace_and_path` varchar(255) DEFAULT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`allergy_id`),
  KEY `allergy_changed_by_fk` (`changed_by`),
  KEY `allergy_coded_allergen_fk` (`coded_allergen`),
  KEY `allergy_creator_fk` (`creator`),
  KEY `allergy_encounter_id_fk` (`encounter_id`),
  KEY `allergy_patient_id_fk` (`patient_id`),
  KEY `allergy_severity_concept_id_fk` (`severity_concept_id`),
  KEY `allergy_voided_by_fk` (`voided_by`),
  CONSTRAINT `allergy_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `allergy_coded_allergen_fk` FOREIGN KEY (`coded_allergen`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `allergy_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `allergy_encounter_id_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `allergy_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `allergy_severity_concept_id_fk` FOREIGN KEY (`severity_concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `allergy_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `allergy_reaction`;
CREATE TABLE `allergy_reaction` (
  `allergy_reaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `allergy_id` int(11) NOT NULL,
  `reaction_concept_id` int(11) NOT NULL,
  `reaction_non_coded` varchar(255) DEFAULT NULL,
  `uuid` char(38) DEFAULT NULL,
  PRIMARY KEY (`allergy_reaction_id`),
  KEY `allergy_reaction_allergy_id_fk` (`allergy_id`),
  KEY `allergy_reaction_reaction_concept_id_fk` (`reaction_concept_id`),
  CONSTRAINT `allergy_reaction_allergy_id_fk` FOREIGN KEY (`allergy_id`) REFERENCES `allergy` (`allergy_id`),
  CONSTRAINT `allergy_reaction_reaction_concept_id_fk` FOREIGN KEY (`reaction_concept_id`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `appointment_service`;
CREATE TABLE `appointment_service` (
  `appointment_service_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `speciality_id` int(11) DEFAULT NULL,
  `max_appointments_limit` int(11) DEFAULT NULL,
  `duration_mins` int(11) DEFAULT NULL,
  `color` varchar(8) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  `initial_appointment_status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`appointment_service_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_appointment_service_speciality_idx` (`speciality_id`),
  KEY `fk_appointment_service_location_idx` (`location_id`),
  CONSTRAINT `fk_appointment_service_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `fk_appointment_service_speciality` FOREIGN KEY (`speciality_id`) REFERENCES `appointment_speciality` (`speciality_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `appointment_service_attribute`;
CREATE TABLE `appointment_service_attribute` (
  `appointment_service_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_service_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`appointment_service_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `appointment_service_attribute_appointment_service_fk` (`appointment_service_id`),
  KEY `appointment_service_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `appointment_service_attribute_creator_fk` (`creator`),
  KEY `appointment_service_attribute_changed_by_fk` (`changed_by`),
  KEY `appointment_service_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `appointment_service_attribute_appointment_service_fk` FOREIGN KEY (`appointment_service_id`) REFERENCES `appointment_service` (`appointment_service_id`),
  CONSTRAINT `appointment_service_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `appointment_service_attribute_type` (`appointment_service_attribute_type_id`),
  CONSTRAINT `appointment_service_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `appointment_service_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `appointment_service_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `appointment_service_attribute_type`;
CREATE TABLE `appointment_service_attribute_type` (
  `appointment_service_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`appointment_service_attribute_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `appointment_service_attribute_type_creator_fk` (`creator`),
  KEY `appointment_service_attribute_type_changed_by_fk` (`changed_by`),
  KEY `appointment_service_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `appointment_service_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `appointment_service_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `appointment_service_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `appointment_service_type`;
CREATE TABLE `appointment_service_type` (
  `appointment_service_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_service_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `duration_mins` int(11) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  PRIMARY KEY (`appointment_service_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_appointment_service_idx` (`appointment_service_id`),
  CONSTRAINT `fk_appointment_service` FOREIGN KEY (`appointment_service_id`) REFERENCES `appointment_service` (`appointment_service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `appointment_service_weekly_availability`;
CREATE TABLE `appointment_service_weekly_availability` (
  `service_weekly_availability_id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) NOT NULL,
  `day_of_week` varchar(45) NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `max_appointments_limit` int(11) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  `voided` tinyint(1) DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`service_weekly_availability_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_weekly_availability_appointment_service_idx` (`service_id`),
  KEY `service_enterer` (`creator`),
  KEY `user_who_deleted_service` (`voided_by`),
  CONSTRAINT `appointment_service` FOREIGN KEY (`service_id`) REFERENCES `appointment_service` (`appointment_service_id`),
  CONSTRAINT `service_enterer` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_deleted_service` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `appointment_speciality`;
CREATE TABLE `appointment_speciality` (
  `speciality_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  `voided` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`speciality_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bed`;
CREATE TABLE `bed` (
  `bed_id` int(11) NOT NULL AUTO_INCREMENT,
  `bed_number` varchar(50) NOT NULL,
  `status` varchar(255) DEFAULT 'AVAILABLE',
  `bed_type_id` int(11) DEFAULT NULL,
  `uuid` char(38) DEFAULT NULL,
  `creator` int(11) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`bed_id`),
  UNIQUE KEY `bed_unique_uuid` (`uuid`),
  KEY `bed_bed_type_fk` (`bed_type_id`),
  KEY `bed_creator` (`creator`),
  KEY `bed_changed_by_fk` (`changed_by`),
  KEY `bed_voided_by_fk` (`voided_by`),
  CONSTRAINT `bed_bed_type_fk` FOREIGN KEY (`bed_type_id`) REFERENCES `bed_type` (`bed_type_id`),
  CONSTRAINT `bed_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bed_location_map`;
CREATE TABLE `bed_location_map` (
  `bed_location_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) NOT NULL,
  `bed_row_number` int(11) DEFAULT NULL,
  `bed_column_number` int(11) DEFAULT NULL,
  `bed_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bed_location_map_id`),
  KEY `bed_location_map_location_fk` (`location_id`),
  KEY `bed_location_map_bed_id_fk` (`bed_id`),
  CONSTRAINT `bed_location_map_bed_id_fk` FOREIGN KEY (`bed_id`) REFERENCES `bed` (`bed_id`),
  CONSTRAINT `bed_location_map_location_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bed_patient_assignment_map`;
CREATE TABLE `bed_patient_assignment_map` (
  `bed_patient_assignment_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `bed_id` int(11) NOT NULL,
  `date_started` datetime NOT NULL,
  `date_stopped` datetime DEFAULT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  `uuid` char(38) DEFAULT NULL,
  `creator` int(11) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`bed_patient_assignment_map_id`),
  UNIQUE KEY `bed_patient_assignment_map_bed_unique_uuid` (`uuid`),
  KEY `bed_id_fk` (`bed_id`),
  KEY `bed_patient_assignment_map_patient_fk` (`patient_id`),
  KEY `bed_patient_assignment_map_encounter_fk` (`encounter_id`),
  KEY `bed_patient_assignment_map_creator` (`creator`),
  KEY `bed_patient_assignment_map_changed_by_fk` (`changed_by`),
  KEY `bed_patient_assignment_map_voided_by_fk` (`voided_by`),
  CONSTRAINT `bed_id_fk` FOREIGN KEY (`bed_id`) REFERENCES `bed` (`bed_id`),
  CONSTRAINT `bed_patient_assignment_map_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_patient_assignment_map_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_patient_assignment_map_encounter_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `bed_patient_assignment_map_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `bed_patient_assignment_map_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bed_tag`;
CREATE TABLE `bed_tag` (
  `bed_tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`bed_tag_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `bed_tag_creator_fk` (`creator`),
  KEY `bed_tag_changed_by_fk` (`changed_by`),
  KEY `bed_tag_voided_by_fk` (`voided_by`),
  CONSTRAINT `bed_tag_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_tag_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_tag_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bed_tag_map`;
CREATE TABLE `bed_tag_map` (
  `bed_tag_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `bed_id` int(11) NOT NULL,
  `bed_tag_id` int(11) NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`bed_tag_map_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `bed_tag_map_bed_fk` (`bed_id`),
  KEY `bed_tag_map_tag_fk` (`bed_tag_id`),
  KEY `bed_tag_map_creator_fk` (`creator`),
  KEY `bed_tag_map_changed_by_fk` (`changed_by`),
  KEY `bed_tag_map_voided_by_fk` (`voided_by`),
  CONSTRAINT `bed_tag_map_bed_fk` FOREIGN KEY (`bed_id`) REFERENCES `bed` (`bed_id`),
  CONSTRAINT `bed_tag_map_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_tag_map_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_tag_map_tag_fk` FOREIGN KEY (`bed_tag_id`) REFERENCES `bed_tag` (`bed_tag_id`),
  CONSTRAINT `bed_tag_map_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bed_type`;
CREATE TABLE `bed_type` (
  `bed_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(10) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `uuid` char(38) DEFAULT NULL,
  `creator` int(11) DEFAULT NULL,
  `date_created` datetime NOT NULL DEFAULT current_timestamp(),
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retire_reason` varchar(255) DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  PRIMARY KEY (`bed_type_id`),
  KEY `bed_type_creator_fk` (`creator`),
  KEY `bed_type_changed_by_fk` (`changed_by`),
  KEY `bed_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `bed_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bed_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bill_discount`;
CREATE TABLE `bill_discount` (
  `bill_discount_id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `bill_line_item_id` int(11) DEFAULT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `discount_status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `justification` varchar(1000) NOT NULL,
  `initiator_id` int(11) NOT NULL,
  `approver_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`bill_discount_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `bill_discount_initiator_id_fk` (`initiator_id`),
  KEY `bill_discount_approver_id_fk` (`approver_id`),
  KEY `bill_discount_creator_fk` (`creator`),
  KEY `bill_discount_changed_by_fk` (`changed_by`),
  KEY `bill_discount_voided_by_fk` (`voided_by`),
  KEY `bill_discount_bill_id_fk` (`bill_id`),
  KEY `bill_discount_bill_line_item_id_fk` (`bill_line_item_id`),
  CONSTRAINT `bill_discount_approver_id_fk` FOREIGN KEY (`approver_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_discount_bill_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `cashier_bill` (`bill_id`) ON DELETE CASCADE,
  CONSTRAINT `bill_discount_bill_line_item_id_fk` FOREIGN KEY (`bill_line_item_id`) REFERENCES `cashier_bill_line_item` (`bill_line_item_id`) ON DELETE CASCADE,
  CONSTRAINT `bill_discount_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_discount_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_discount_initiator_id_fk` FOREIGN KEY (`initiator_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_discount_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bill_exemption`;
CREATE TABLE `bill_exemption` (
  `exemption_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `concept_id` int(11) NOT NULL,
  `exemption_type` varchar(20) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`exemption_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `bill_exemption_concept_id_idx` (`concept_id`,`retired`),
  KEY `bill_exemption_type_idx` (`exemption_type`,`retired`),
  KEY `bill_exemption_creator_fk` (`creator`),
  KEY `bill_exemption_changed_by_fk` (`changed_by`),
  KEY `bill_exemption_retired_by_fk` (`retired_by`),
  CONSTRAINT `bill_exemption_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_exemption_concept_fk` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `bill_exemption_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_exemption_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bill_exemption_rule`;
CREATE TABLE `bill_exemption_rule` (
  `rule_id` int(11) NOT NULL AUTO_INCREMENT,
  `exemption_id` int(11) NOT NULL,
  `script_type` varchar(20) NOT NULL,
  `script` text NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`rule_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `bill_exemption_rule_exemption_id_idx` (`exemption_id`,`voided`),
  KEY `bill_exemption_rule_creator_fk` (`creator`),
  KEY `bill_exemption_rule_changed_by_fk` (`changed_by`),
  KEY `bill_exemption_rule_voided_by_fk` (`voided_by`),
  CONSTRAINT `bill_exemption_rule_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_exemption_rule_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_exemption_rule_exemption_fk` FOREIGN KEY (`exemption_id`) REFERENCES `bill_exemption` (`exemption_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bill_exemption_rule_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bill_refund`;
CREATE TABLE `bill_refund` (
  `bill_refund_id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `bill_line_item_id` int(11) DEFAULT NULL,
  `refund_amount` decimal(10,2) NOT NULL,
  `reason` varchar(1000) NOT NULL,
  `refund_status` varchar(20) NOT NULL DEFAULT 'REQUESTED',
  `initiator_id` int(11) NOT NULL,
  `approver_id` int(11) DEFAULT NULL,
  `completer_id` int(11) DEFAULT NULL,
  `date_approved` datetime DEFAULT NULL,
  `date_completed` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`bill_refund_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `bill_refund_initiator_id_fk` (`initiator_id`),
  KEY `bill_refund_approver_id_fk` (`approver_id`),
  KEY `bill_refund_completer_id_fk` (`completer_id`),
  KEY `bill_refund_creator_fk` (`creator`),
  KEY `bill_refund_changed_by_fk` (`changed_by`),
  KEY `bill_refund_voided_by_fk` (`voided_by`),
  KEY `idx_bill_refund_bill_id` (`bill_id`),
  KEY `idx_bill_refund_line_item_id` (`bill_line_item_id`),
  CONSTRAINT `bill_refund_approver_id_fk` FOREIGN KEY (`approver_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_refund_bill_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `cashier_bill` (`bill_id`) ON DELETE CASCADE,
  CONSTRAINT `bill_refund_bill_line_item_id_fk` FOREIGN KEY (`bill_line_item_id`) REFERENCES `cashier_bill_line_item` (`bill_line_item_id`) ON DELETE CASCADE,
  CONSTRAINT `bill_refund_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_refund_completer_id_fk` FOREIGN KEY (`completer_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_refund_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_refund_initiator_id_fk` FOREIGN KEY (`initiator_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bill_refund_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `calculation_registration`;
CREATE TABLE `calculation_registration` (
  `calculation_registration_id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `provider_class_name` varchar(512) NOT NULL,
  `calculation_name` varchar(512) NOT NULL,
  `configuration` text DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`calculation_registration_id`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `care_setting`;
CREATE TABLE `care_setting` (
  `care_setting_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `care_setting_type` varchar(50) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`care_setting_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `care_setting_changed_by` (`changed_by`),
  KEY `care_setting_creator` (`creator`),
  KEY `care_setting_retired_by` (`retired_by`),
  CONSTRAINT `care_setting_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `care_setting_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `care_setting_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_bill`;
CREATE TABLE `cashier_bill` (
  `bill_id` int(11) NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(255) DEFAULT NULL,
  `provider_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `cash_point_id` int(11) NOT NULL,
  `adjusted_bill_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `receipt_printed` tinyint(1) NOT NULL DEFAULT 0,
  `adjustment_reason` varchar(500) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `visit_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bill_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `cashier_bill_receipt_number_idx` (`receipt_number`),
  KEY `cashier_bill_patient_id_idx` (`patient_id`),
  KEY `cashier_bill_provider_fk` (`provider_id`),
  KEY `cashier_bill_cash_point_fk` (`cash_point_id`),
  KEY `cashier_bill_creator_fk` (`creator`),
  KEY `cashier_bill_changed_by_fk` (`changed_by`),
  KEY `cashier_bill_voided_by_fk` (`voided_by`),
  KEY `cashier_bill_adjusted_bill_fk` (`adjusted_bill_id`),
  KEY `cashier_date_created` (`date_created`),
  KEY `cashier_bill_visit_id_idx` (`visit_id`),
  CONSTRAINT `cashier_bill_adjusted_bill_fk` FOREIGN KEY (`adjusted_bill_id`) REFERENCES `cashier_bill` (`bill_id`),
  CONSTRAINT `cashier_bill_cash_point_fk` FOREIGN KEY (`cash_point_id`) REFERENCES `cashier_cash_point` (`cash_point_id`),
  CONSTRAINT `cashier_bill_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_bill_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_bill_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `cashier_bill_provider_fk` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `cashier_bill_visit_fk` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cashier_bill_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_billable_service`;
CREATE TABLE `cashier_billable_service` (
  `service_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `short_name` varchar(255) DEFAULT NULL,
  `service_type` int(11) DEFAULT NULL,
  `service_category` int(11) DEFAULT NULL,
  `service_status` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `concept_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`service_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_cashier_billable_service_concept_id_fk` (`concept_id`),
  CONSTRAINT `cashier_cashier_billable_service_concept_id_fk` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_bill_line_item`;
CREATE TABLE `cashier_bill_line_item` (
  `bill_line_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `price_name` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `line_item_order` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `price_id` int(11) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bill_line_item_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_bill_line_item_bill_id_fk` (`bill_id`),
  KEY `cashier_bill_line_item_creator_fk` (`creator`),
  KEY `cashier_bill_line_item_changed_by_fk` (`changed_by`),
  KEY `cashier_bill_line_item_voided_by_fk` (`voided_by`),
  KEY `cashier_bill_line_item_item_id_fk` (`item_id`),
  KEY `cashier_bill_line_item_service_id_fk` (`service_id`),
  KEY `cashier_bill_line_item_order_id_fk` (`order_id`),
  CONSTRAINT `cashier_bill_line_item_bill_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `cashier_bill` (`bill_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_bill_line_item_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_bill_line_item_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_bill_line_item_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`),
  CONSTRAINT `cashier_bill_line_item_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_bill_line_item_service_id_fk` FOREIGN KEY (`service_id`) REFERENCES `cashier_billable_service` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_bill_line_item_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_bill_payment`;
CREATE TABLE `cashier_bill_payment` (
  `bill_payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `payment_mode_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `amount_tendered` decimal(10,2) NOT NULL,
  `provider_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bill_payment_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_bill_payment_bill_id_fk` (`bill_id`),
  KEY `cashier_bill_payment_payment_mode_id_fk` (`payment_mode_id`),
  KEY `cashier_bill_payment_creator_fk` (`creator`),
  KEY `cashier_bill_payment_changed_by_fk` (`changed_by`),
  KEY `cashier_bill_payment_voided_by_fk` (`voided_by`),
  KEY `cashier_bill_payment_provider_id_fk` (`provider_id`),
  CONSTRAINT `cashier_bill_payment_bill_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `cashier_bill` (`bill_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_bill_payment_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_bill_payment_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_bill_payment_payment_mode_id_fk` FOREIGN KEY (`payment_mode_id`) REFERENCES `cashier_payment_mode` (`payment_mode_id`),
  CONSTRAINT `cashier_bill_payment_provider_id_fk` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cashier_bill_payment_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_bill_payment_attribute`;
CREATE TABLE `cashier_bill_payment_attribute` (
  `bill_payment_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_payment_id` int(11) NOT NULL,
  `payment_mode_attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`bill_payment_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_bill_payment_attribute_bill_payment_id_fk` (`bill_payment_id`),
  KEY `cashier_bill_payment_attribute_payment_mode_attribute_type_id_fk` (`payment_mode_attribute_type_id`),
  CONSTRAINT `cashier_bill_payment_attribute_bill_payment_id_fk` FOREIGN KEY (`bill_payment_id`) REFERENCES `cashier_bill_payment` (`bill_payment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_bill_payment_attribute_payment_mode_attribute_type_id_fk` FOREIGN KEY (`payment_mode_attribute_type_id`) REFERENCES `cashier_payment_mode_attribute_type` (`payment_mode_attribute_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_cash_point`;
CREATE TABLE `cashier_cash_point` (
  `cash_point_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(1024) DEFAULT '',
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`cash_point_id`),
  KEY `cashier_cash_point_creator_fk` (`creator`),
  KEY `cashier_cash_point_changed_by_fk` (`changed_by`),
  KEY `cashier_cash_point_retired_by_fk` (`retired_by`),
  KEY `cashier_cash_point_location_fk` (`location_id`),
  CONSTRAINT `cashier_cash_point_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_cash_point_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_cash_point_location_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `cashier_cash_point_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_department`;
CREATE TABLE `cashier_department` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(1024) DEFAULT '',
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_department_creator_fk` (`creator`),
  KEY `cashier_department_changed_by_fk` (`changed_by`),
  KEY `cashier_department_retired_by_fk` (`retired_by`),
  CONSTRAINT `cashier_department_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_department_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_department_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_item`;
CREATE TABLE `cashier_item` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(1024) DEFAULT '',
  `department_id` int(11) NOT NULL,
  `default_price_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_item_name_idx` (`name`,`retired`),
  KEY `cashier_item_department_name_idx` (`department_id`,`name`,`retired`),
  KEY `cashier_item_creator_fk` (`creator`),
  KEY `cashier_item_changed_by_fk` (`changed_by`),
  KEY `cashier_item_retired_by_fk` (`retired_by`),
  CONSTRAINT `cashier_item_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_department_fk` FOREIGN KEY (`department_id`) REFERENCES `cashier_department` (`department_id`),
  CONSTRAINT `cashier_item_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_item_attribute`;
CREATE TABLE `cashier_item_attribute` (
  `item_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `item_attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`item_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_item_attribute_attribute_type_id_fk` (`item_attribute_type_id`),
  KEY `cashier_item_attribute_item_id_fk` (`item_id`),
  KEY `cashier_item_attribute_creator_fk` (`creator`),
  KEY `cashier_item_attribute_changed_by_fk` (`changed_by`),
  KEY `cashier_item_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `cashier_item_attribute_attribute_type_id_fk` FOREIGN KEY (`item_attribute_type_id`) REFERENCES `cashier_item_attribute_type` (`item_attribute_type_id`),
  CONSTRAINT `cashier_item_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_attribute_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `cashier_item` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_item_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_item_attribute_type`;
CREATE TABLE `cashier_item_attribute_type` (
  `item_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`item_attribute_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_item_attribute_type_creator_fk` (`creator`),
  KEY `cashier_item_attribute_type_changed_by_fk` (`changed_by`),
  KEY `cashier_item_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `cashier_item_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_item_code`;
CREATE TABLE `cashier_item_code` (
  `item_code_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT '',
  `description` varchar(1024) DEFAULT '',
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`item_code_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_item_code_item_id_fk` (`item_id`),
  KEY `cashier_item_code_creator_fk` (`creator`),
  KEY `cashier_item_code_changed_by_fk` (`changed_by`),
  KEY `cashier_item_code_retired_by_fk` (`retired_by`),
  CONSTRAINT `cashier_item_code_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_code_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_code_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `cashier_item` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_item_code_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_item_price`;
CREATE TABLE `cashier_item_price` (
  `item_price_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `payment_mode` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT '',
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`item_price_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_item_price_item_id_fk` (`item_id`),
  KEY `cashier_item_price_service_id_fk` (`service_id`),
  KEY `cashier_item_price_creator_fk` (`creator`),
  KEY `cashier_item_price_changed_by_fk` (`changed_by`),
  KEY `cashier_item_price_retired_by_fk` (`retired_by`),
  KEY `cashier_billable_service_payment_mode_fk` (`payment_mode`),
  CONSTRAINT `cashier_billable_service_payment_mode_fk` FOREIGN KEY (`payment_mode`) REFERENCES `cashier_payment_mode` (`payment_mode_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_item_price_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_price_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_price_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_item_price_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_item_price_service_id_fk` FOREIGN KEY (`service_id`) REFERENCES `cashier_billable_service` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_payment_mode`;
CREATE TABLE `cashier_payment_mode` (
  `payment_mode_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(1024) DEFAULT '',
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `sort_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`payment_mode_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_payment_mode_creator_fk` (`creator`),
  KEY `cashier_payment_mode_changed_by_fk` (`changed_by`),
  KEY `cashier_payment_mode_retired_by_fk` (`retired_by`),
  CONSTRAINT `cashier_payment_mode_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_payment_mode_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_payment_mode_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_payment_mode_attribute_type`;
CREATE TABLE `cashier_payment_mode_attribute_type` (
  `payment_mode_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `payment_mode_id` int(11) NOT NULL,
  `attribute_order` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `foreignKey` int(11) DEFAULT NULL,
  `format` varchar(255) DEFAULT NULL,
  `reg_exp` varchar(255) DEFAULT NULL,
  `required` tinyint(1) DEFAULT 0,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`payment_mode_attribute_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_payment_mode_attribute_type_payment_mode_id_fk` (`payment_mode_id`),
  KEY `cashier_payment_mode_attribute_type_creator_fk` (`creator`),
  KEY `cashier_payment_mode_attribute_type_changed_by_fk` (`changed_by`),
  KEY `cashier_payment_mode_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `cashier_payment_mode_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_payment_mode_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_payment_mode_attribute_type_payment_mode_id_fk` FOREIGN KEY (`payment_mode_id`) REFERENCES `cashier_payment_mode` (`payment_mode_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cashier_payment_mode_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_seq_group_sequence`;
CREATE TABLE `cashier_seq_group_sequence` (
  `seq_group_sequence_id` int(11) NOT NULL AUTO_INCREMENT,
  `sequence_group` varchar(50) NOT NULL,
  `sequence_value` int(11) NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`seq_group_sequence_id`),
  UNIQUE KEY `sequence_group` (`sequence_group`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_seq_group_sequence_sequence_group_idx` (`sequence_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_seq_receipt_number_generator`;
CREATE TABLE `cashier_seq_receipt_number_generator` (
  `seq_receipt_number_generator_id` int(11) NOT NULL AUTO_INCREMENT,
  `sequence_separator` varchar(5) NOT NULL,
  `cashier_prefix` varchar(5) NOT NULL,
  `cash_point_prefix` varchar(5) NOT NULL,
  `sequence_padding` int(11) NOT NULL,
  `has_check_digit` tinyint(1) NOT NULL,
  `uuid` char(38) NOT NULL,
  `sequence_type` varchar(20) NOT NULL,
  `grouping_type` varchar(25) NOT NULL,
  PRIMARY KEY (`seq_receipt_number_generator_id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cashier_timesheet`;
CREATE TABLE `cashier_timesheet` (
  `timesheet_id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `cash_point_id` int(11) NOT NULL,
  `clock_in` datetime NOT NULL,
  `clock_out` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`timesheet_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cashier_timesheet_provider_clock_in` (`provider_id`,`clock_in`),
  KEY `cashier_timesheet_cash_point_fk` (`cash_point_id`),
  KEY `cashier_timesheet_creator_fk` (`creator`),
  KEY `cashier_timesheet_changed_by_fk` (`changed_by`),
  KEY `cashier_timesheet_voided_by_fk` (`voided_by`),
  CONSTRAINT `cashier_timesheet_cash_point_fk` FOREIGN KEY (`cash_point_id`) REFERENCES `cashier_cash_point` (`cash_point_id`),
  CONSTRAINT `cashier_timesheet_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_timesheet_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cashier_timesheet_provider_fk` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `cashier_timesheet_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `clob_datatype_storage`;
CREATE TABLE `clob_datatype_storage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `value` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cohort`;
CREATE TABLE `cohort` (
  `cohort_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `is_group_cohort` tinyint(1) DEFAULT NULL,
  `cohort_type_id` int(11) DEFAULT NULL,
  `definition_handler` varchar(255) DEFAULT NULL,
  `definition_handler_config` longtext DEFAULT NULL,
  PRIMARY KEY (`cohort_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cohort_creator` (`creator`),
  KEY `user_who_changed_cohort` (`changed_by`),
  KEY `user_who_voided_cohort` (`voided_by`),
  KEY `cohort_location_type_idx` (`location_id`,`cohort_type_id`),
  KEY `cohort_cohort_type_fk` (`cohort_type_id`),
  CONSTRAINT `cohort_cohort_type_fk` FOREIGN KEY (`cohort_type_id`) REFERENCES `cohort_type` (`cohort_type_id`),
  CONSTRAINT `cohort_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_location_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `user_who_changed_cohort` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_voided_cohort` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cohort_attribute`;
CREATE TABLE `cohort_attribute` (
  `cohort_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `cohort_id` int(11) NOT NULL,
  `value_reference` varchar(255) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(255) NOT NULL,
  PRIMARY KEY (`cohort_attribute_id`),
  KEY `cohort_attribute_type_fk` (`attribute_type_id`),
  KEY `cohort_attribute_creator_fk` (`creator`),
  KEY `cohort_attribute_cohort_fk` (`cohort_id`),
  KEY `cohort_attribute_editor_fk` (`changed_by`),
  KEY `cohort_attribute_void_fk` (`voided_by`),
  CONSTRAINT `cohort_attribute_cohort_fk` FOREIGN KEY (`cohort_id`) REFERENCES `cohort` (`cohort_id`),
  CONSTRAINT `cohort_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_attribute_editor_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_attribute_type_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `cohort_attribute_type` (`cohort_attribute_type_id`),
  CONSTRAINT `cohort_attribute_void_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cohort_attribute_type`;
CREATE TABLE `cohort_attribute_type` (
  `cohort_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(255) NOT NULL,
  PRIMARY KEY (`cohort_attribute_type_id`),
  KEY `cohort_attribute_type_creator_fk` (`creator`),
  KEY `cohort_attribute_type_editor_fk` (`changed_by`),
  KEY `cohort_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `cohort_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_attribute_type_editor_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cohort_member`;
CREATE TABLE `cohort_member` (
  `cohort_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `cohort_member_id` int(11) NOT NULL AUTO_INCREMENT,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `date_changed` date DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`cohort_member_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `cohort_member_creator` (`creator`),
  KEY `member_patient` (`patient_id`),
  KEY `parent_cohort` (`cohort_id`),
  KEY `cohortmemberchangedby_fk` (`changed_by`),
  KEY `cohort_member_dates` (`voided`,`start_date`,`end_date`),
  KEY `cohort_member_start_date` (`start_date`),
  KEY `cohort_member_end_date` (`end_date`),
  CONSTRAINT `cohort_member_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohortmemberchangedby_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `member_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `parent_cohort` FOREIGN KEY (`cohort_id`) REFERENCES `cohort` (`cohort_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cohort_member_attribute`;
CREATE TABLE `cohort_member_attribute` (
  `cohort_member_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `cohort_member_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `cohort_member_attribute_type_id` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`cohort_member_attribute_id`),
  KEY `cohort_member_attribute_editor_fk` (`changed_by`),
  KEY `cohort_member_attribute_voided_by_fk` (`voided_by`),
  KEY `cohort_member_attribute_type_fk` (`cohort_member_attribute_type_id`),
  KEY `cohort_member_attribute_cohort_member_fk` (`cohort_member_id`),
  KEY `cohort_member_attribute_creator_fk` (`creator`),
  CONSTRAINT `cohort_member_attribute_cohort_member_fk` FOREIGN KEY (`cohort_member_id`) REFERENCES `cohort_member` (`cohort_member_id`),
  CONSTRAINT `cohort_member_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_member_attribute_editor_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_member_attribute_type_fk` FOREIGN KEY (`cohort_member_attribute_type_id`) REFERENCES `cohort_member_attribute_type` (`cohort_member_attribute_type_id`),
  CONSTRAINT `cohort_member_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cohort_member_attribute_type`;
CREATE TABLE `cohort_member_attribute_type` (
  `cohort_member_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`cohort_member_attribute_type_id`),
  KEY `cohort_member_attribute_type_changed_by_fk` (`changed_by`),
  KEY `cohort_member_attribute_type_voided_by_fk` (`retired_by`),
  KEY `cohort_member_attribute_type_creator_fk` (`creator`),
  CONSTRAINT `cohort_member_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_member_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohort_member_attribute_type_voided_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cohort_type`;
CREATE TABLE `cohort_type` (
  `cohort_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(255) NOT NULL,
  PRIMARY KEY (`cohort_type_id`),
  KEY `cohorttypeeditor_fk` (`changed_by`),
  KEY `cohorttypecreator_fk` (`creator`),
  KEY `cohorttypevoider_fk` (`voided_by`),
  CONSTRAINT `cohorttypecreator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohorttypeeditor_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cohorttypevoider_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept`;
CREATE TABLE `concept` (
  `concept_id` int(11) NOT NULL AUTO_INCREMENT,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `short_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `form_text` text DEFAULT NULL,
  `datatype_id` int(11) NOT NULL DEFAULT 0,
  `class_id` int(11) NOT NULL DEFAULT 0,
  `is_set` tinyint(1) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_classes` (`class_id`),
  KEY `concept_creator` (`creator`),
  KEY `concept_datatypes` (`datatype_id`),
  KEY `user_who_changed_concept` (`changed_by`),
  KEY `user_who_retired_concept` (`retired_by`),
  CONSTRAINT `concept_classes` FOREIGN KEY (`class_id`) REFERENCES `concept_class` (`concept_class_id`),
  CONSTRAINT `concept_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `concept_datatypes` FOREIGN KEY (`datatype_id`) REFERENCES `concept_datatype` (`concept_datatype_id`),
  CONSTRAINT `user_who_changed_concept` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_concept` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_answer`;
CREATE TABLE `concept_answer` (
  `concept_answer_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `answer_concept` int(11) DEFAULT NULL,
  `answer_drug` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `sort_weight` double DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_answer_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `answer` (`answer_concept`),
  KEY `answer_answer_drug_fk` (`answer_drug`),
  KEY `answer_creator` (`creator`),
  KEY `answers_for_concept` (`concept_id`),
  CONSTRAINT `answer` FOREIGN KEY (`answer_concept`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `answer_answer_drug_fk` FOREIGN KEY (`answer_drug`) REFERENCES `drug` (`drug_id`),
  CONSTRAINT `answer_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `answers_for_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_attribute`;
CREATE TABLE `concept_attribute` (
  `concept_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`concept_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `concept_attribute_changed_by_fk` (`changed_by`),
  KEY `concept_attribute_concept_fk` (`concept_id`),
  KEY `concept_attribute_creator_fk` (`creator`),
  KEY `concept_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `concept_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `concept_attribute_type` (`concept_attribute_type_id`),
  CONSTRAINT `concept_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `concept_attribute_concept_fk` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `concept_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `concept_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_attribute_type`;
CREATE TABLE `concept_attribute_type` (
  `concept_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_attribute_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_attribute_type_changed_by_fk` (`changed_by`),
  KEY `concept_attribute_type_creator_fk` (`creator`),
  KEY `concept_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `concept_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `concept_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `concept_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_class`;
CREATE TABLE `concept_class` (
  `concept_class_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`concept_class_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_class_changed_by` (`changed_by`),
  KEY `concept_class_creator` (`creator`),
  KEY `concept_class_name_index` (`name`),
  KEY `concept_class_retired_status` (`retired`),
  KEY `user_who_retired_concept_class` (`retired_by`),
  CONSTRAINT `concept_class_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `concept_class_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_concept_class` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_complex`;
CREATE TABLE `concept_complex` (
  `concept_id` int(11) NOT NULL,
  `handler` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`concept_id`),
  CONSTRAINT `concept_attributes` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_datatype`;
CREATE TABLE `concept_datatype` (
  `concept_datatype_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `hl7_abbreviation` varchar(3) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_datatype_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_datatype_creator` (`creator`),
  KEY `concept_datatype_name_index` (`name`),
  KEY `concept_datatype_retired_status` (`retired`),
  KEY `user_who_retired_concept_datatype` (`retired_by`),
  CONSTRAINT `concept_datatype_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_concept_datatype` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_description`;
CREATE TABLE `concept_description` (
  `concept_description_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `description` text NOT NULL,
  `locale` varchar(50) NOT NULL DEFAULT '',
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_description_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `description_for_concept` (`concept_id`),
  KEY `user_who_changed_description` (`changed_by`),
  KEY `user_who_created_description` (`creator`),
  CONSTRAINT `description_for_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `user_who_changed_description` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_created_description` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_map_type`;
CREATE TABLE `concept_map_type` (
  `concept_map_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_map_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `mapped_user_changed_concept_map_type` (`changed_by`),
  KEY `mapped_user_creator_concept_map_type` (`creator`),
  KEY `mapped_user_retired_concept_map_type` (`retired_by`),
  CONSTRAINT `mapped_user_changed_concept_map_type` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `mapped_user_creator_concept_map_type` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `mapped_user_retired_concept_map_type` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_name`;
CREATE TABLE `concept_name` (
  `concept_name_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `locale` varchar(50) NOT NULL DEFAULT '',
  `locale_preferred` tinyint(1) DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `concept_name_type` varchar(50) DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`concept_name_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_name_changed_by` (`changed_by`),
  KEY `name_for_concept` (`concept_id`),
  KEY `name_of_concept` (`name`),
  KEY `user_who_created_name` (`creator`),
  KEY `user_who_voided_this_name` (`voided_by`),
  KEY `concept_name_duplicate` (`name`,`locale`,`voided`),
  CONSTRAINT `concept_name_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `name_for_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `user_who_created_name` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_voided_this_name` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_name_tag`;
CREATE TABLE `concept_name_tag` (
  `concept_name_tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `tag` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`concept_name_tag_id`),
  UNIQUE KEY `tag` (`tag`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_name_tag_changed_by` (`changed_by`),
  KEY `user_who_created_name_tag` (`creator`),
  KEY `user_who_voided_name_tag` (`voided_by`),
  CONSTRAINT `concept_name_tag_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_name_tag_map`;
CREATE TABLE `concept_name_tag_map` (
  `concept_name_id` int(11) NOT NULL,
  `concept_name_tag_id` int(11) NOT NULL,
  KEY `mapped_concept_name` (`concept_name_id`),
  KEY `mapped_concept_name_tag` (`concept_name_tag_id`),
  CONSTRAINT `mapped_concept_name` FOREIGN KEY (`concept_name_id`) REFERENCES `concept_name` (`concept_name_id`),
  CONSTRAINT `mapped_concept_name_tag` FOREIGN KEY (`concept_name_tag_id`) REFERENCES `concept_name_tag` (`concept_name_tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_numeric`;
CREATE TABLE `concept_numeric` (
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `hi_absolute` double DEFAULT NULL,
  `hi_critical` double DEFAULT NULL,
  `hi_normal` double DEFAULT NULL,
  `low_absolute` double DEFAULT NULL,
  `low_critical` double DEFAULT NULL,
  `low_normal` double DEFAULT NULL,
  `units` varchar(50) DEFAULT NULL,
  `allow_decimal` tinyint(1) DEFAULT 0,
  `display_precision` int(11) DEFAULT NULL,
  PRIMARY KEY (`concept_id`),
  CONSTRAINT `numeric_attributes` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_proposal`;
CREATE TABLE `concept_proposal` (
  `concept_proposal_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) DEFAULT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  `original_text` varchar(255) NOT NULL DEFAULT '',
  `final_text` varchar(255) DEFAULT NULL,
  `obs_id` int(11) DEFAULT NULL,
  `obs_concept_id` int(11) DEFAULT NULL,
  `state` varchar(32) NOT NULL DEFAULT 'UNMAPPED',
  `comments` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `locale` varchar(50) NOT NULL DEFAULT '',
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_proposal_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_for_proposal` (`concept_id`),
  KEY `encounter_for_proposal` (`encounter_id`),
  KEY `proposal_obs_concept_id` (`obs_concept_id`),
  KEY `proposal_obs_id` (`obs_id`),
  KEY `user_who_changed_proposal` (`changed_by`),
  KEY `user_who_created_proposal` (`creator`),
  CONSTRAINT `concept_for_proposal` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `encounter_for_proposal` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `proposal_obs_concept_id` FOREIGN KEY (`obs_concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `proposal_obs_id` FOREIGN KEY (`obs_id`) REFERENCES `obs` (`obs_id`),
  CONSTRAINT `user_who_changed_proposal` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_created_proposal` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_proposal_tag_map`;
CREATE TABLE `concept_proposal_tag_map` (
  `concept_proposal_id` int(11) NOT NULL,
  `concept_name_tag_id` int(11) NOT NULL,
  KEY `mapped_concept_proposal` (`concept_proposal_id`),
  KEY `mapped_concept_proposal_tag` (`concept_name_tag_id`),
  CONSTRAINT `mapped_concept_proposal` FOREIGN KEY (`concept_proposal_id`) REFERENCES `concept_proposal` (`concept_proposal_id`),
  CONSTRAINT `mapped_concept_proposal_tag` FOREIGN KEY (`concept_name_tag_id`) REFERENCES `concept_name_tag` (`concept_name_tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_reference_map`;
CREATE TABLE `concept_reference_map` (
  `concept_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_reference_term_id` int(11) NOT NULL,
  `concept_map_type_id` int(11) NOT NULL DEFAULT 1,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_map_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `map_creator` (`creator`),
  KEY `map_for_concept` (`concept_id`),
  KEY `mapped_concept_map_type` (`concept_map_type_id`),
  KEY `mapped_concept_reference_term` (`concept_reference_term_id`),
  KEY `mapped_user_changed_ref_term` (`changed_by`),
  CONSTRAINT `map_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `map_for_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `mapped_concept_map_type` FOREIGN KEY (`concept_map_type_id`) REFERENCES `concept_map_type` (`concept_map_type_id`),
  CONSTRAINT `mapped_concept_reference_term` FOREIGN KEY (`concept_reference_term_id`) REFERENCES `concept_reference_term` (`concept_reference_term_id`),
  CONSTRAINT `mapped_user_changed_ref_term` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_reference_range`;
CREATE TABLE `concept_reference_range` (
  `concept_reference_range_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) NOT NULL,
  `criteria` text DEFAULT NULL,
  `hi_absolute` double DEFAULT NULL,
  `hi_critical` double DEFAULT NULL,
  `hi_normal` double DEFAULT NULL,
  `low_absolute` double DEFAULT NULL,
  `low_critical` double DEFAULT NULL,
  `low_normal` double DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_reference_range_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_concept_numeric_reference_range` (`concept_id`),
  CONSTRAINT `fk_concept_numeric_reference_range` FOREIGN KEY (`concept_id`) REFERENCES `concept_numeric` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_reference_source`;
CREATE TABLE `concept_reference_source` (
  `concept_source_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `hl7_code` varchar(50) DEFAULT '',
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `unique_id` varchar(250) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`concept_source_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `hl7_code` (`hl7_code`),
  UNIQUE KEY `unique_id` (`unique_id`),
  KEY `concept_reference_source_changed_by` (`changed_by`),
  KEY `concept_source_creator` (`creator`),
  KEY `user_who_retired_concept_source` (`retired_by`),
  KEY `concept_reference_source_name` (`name`),
  CONSTRAINT `concept_reference_source_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `concept_source_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_concept_source` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_reference_term`;
CREATE TABLE `concept_reference_term` (
  `concept_reference_term_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_source_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `version` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_reference_term_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_code_concept_reference_term` (`code`),
  KEY `mapped_concept_source` (`concept_source_id`),
  KEY `mapped_user_changed` (`changed_by`),
  KEY `mapped_user_creator` (`creator`),
  KEY `mapped_user_retired` (`retired_by`),
  KEY `concept_reference_term_code` (`concept_source_id`,`code`),
  CONSTRAINT `mapped_concept_source` FOREIGN KEY (`concept_source_id`) REFERENCES `concept_reference_source` (`concept_source_id`),
  CONSTRAINT `mapped_user_changed` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `mapped_user_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `mapped_user_retired` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_reference_term_map`;
CREATE TABLE `concept_reference_term_map` (
  `concept_reference_term_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `term_a_id` int(11) NOT NULL,
  `term_b_id` int(11) NOT NULL,
  `a_is_to_b_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_reference_term_map_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `mapped_concept_map_type_ref_term_map` (`a_is_to_b_id`),
  KEY `mapped_term_a` (`term_a_id`),
  KEY `mapped_term_b` (`term_b_id`),
  KEY `mapped_user_changed_ref_term_map` (`changed_by`),
  KEY `mapped_user_creator_ref_term_map` (`creator`),
  CONSTRAINT `mapped_concept_map_type_ref_term_map` FOREIGN KEY (`a_is_to_b_id`) REFERENCES `concept_map_type` (`concept_map_type_id`),
  CONSTRAINT `mapped_term_a` FOREIGN KEY (`term_a_id`) REFERENCES `concept_reference_term` (`concept_reference_term_id`),
  CONSTRAINT `mapped_term_b` FOREIGN KEY (`term_b_id`) REFERENCES `concept_reference_term` (`concept_reference_term_id`),
  CONSTRAINT `mapped_user_changed_ref_term_map` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `mapped_user_creator_ref_term_map` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_set`;
CREATE TABLE `concept_set` (
  `concept_set_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `concept_set` int(11) NOT NULL DEFAULT 0,
  `sort_weight` double DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_set_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `has_a` (`concept_set`),
  KEY `idx_concept_set_concept` (`concept_id`),
  KEY `user_who_created` (`creator`),
  CONSTRAINT `has_a` FOREIGN KEY (`concept_set`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `user_who_created` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_state_conversion`;
CREATE TABLE `concept_state_conversion` (
  `concept_state_conversion_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) DEFAULT 0,
  `program_workflow_id` int(11) DEFAULT 0,
  `program_workflow_state_id` int(11) DEFAULT 0,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_state_conversion_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `unique_workflow_concept_in_conversion` (`program_workflow_id`,`concept_id`),
  KEY `concept_triggers_conversion` (`concept_id`),
  KEY `conversion_to_state` (`program_workflow_state_id`),
  CONSTRAINT `concept_triggers_conversion` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `conversion_involves_workflow` FOREIGN KEY (`program_workflow_id`) REFERENCES `program_workflow` (`program_workflow_id`),
  CONSTRAINT `conversion_to_state` FOREIGN KEY (`program_workflow_state_id`) REFERENCES `program_workflow_state` (`program_workflow_state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `concept_stop_word`;
CREATE TABLE `concept_stop_word` (
  `concept_stop_word_id` int(11) NOT NULL AUTO_INCREMENT,
  `word` varchar(50) NOT NULL,
  `locale` varchar(50) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`concept_stop_word_id`),
  UNIQUE KEY `Unique_StopWord_Key` (`word`,`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `conditions`;
CREATE TABLE `conditions` (
  `condition_id` int(11) NOT NULL AUTO_INCREMENT,
  `additional_detail` varchar(255) DEFAULT NULL,
  `previous_version` int(11) DEFAULT NULL,
  `condition_coded` int(11) DEFAULT NULL,
  `condition_non_coded` varchar(255) DEFAULT NULL,
  `condition_coded_name` int(11) DEFAULT NULL,
  `clinical_status` varchar(50) NOT NULL,
  `verification_status` varchar(50) DEFAULT NULL,
  `onset_date` datetime DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `patient_id` int(11) NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  `form_namespace_and_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`condition_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `condition_changed_by_fk` (`changed_by`),
  KEY `condition_condition_coded_fk` (`condition_coded`),
  KEY `condition_condition_coded_name_fk` (`condition_coded_name`),
  KEY `condition_creator_fk` (`creator`),
  KEY `condition_patient_fk` (`patient_id`),
  KEY `condition_previous_version_fk` (`previous_version`),
  KEY `condition_voided_by_fk` (`voided_by`),
  KEY `conditions_encounter_id_fk` (`encounter_id`),
  CONSTRAINT `condition_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `condition_condition_coded_fk` FOREIGN KEY (`condition_coded`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `condition_condition_coded_name_fk` FOREIGN KEY (`condition_coded_name`) REFERENCES `concept_name` (`concept_name_id`),
  CONSTRAINT `condition_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `condition_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `condition_previous_version_fk` FOREIGN KEY (`previous_version`) REFERENCES `conditions` (`condition_id`),
  CONSTRAINT `condition_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `conditions_encounter_id_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `diagnosis_attribute`;
CREATE TABLE `diagnosis_attribute` (
  `diagnosis_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `diagnosis_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`diagnosis_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `diagnosis_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `diagnosis_attribute_changed_by_fk` (`changed_by`),
  KEY `diagnosis_attribute_creator_fk` (`creator`),
  KEY `diagnosis_attribute_diagnosis_fk` (`diagnosis_id`),
  KEY `diagnosis_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `diagnosis_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `diagnosis_attribute_type` (`diagnosis_attribute_type_id`),
  CONSTRAINT `diagnosis_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `diagnosis_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `diagnosis_attribute_diagnosis_fk` FOREIGN KEY (`diagnosis_id`) REFERENCES `encounter_diagnosis` (`diagnosis_id`),
  CONSTRAINT `diagnosis_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `diagnosis_attribute_type`;
CREATE TABLE `diagnosis_attribute_type` (
  `diagnosis_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`diagnosis_attribute_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `diagnosis_attribute_type_changed_by_fk` (`changed_by`),
  KEY `diagnosis_attribute_type_creator_fk` (`creator`),
  KEY `diagnosis_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `diagnosis_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `diagnosis_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `diagnosis_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `drug`;
CREATE TABLE `drug` (
  `drug_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `name` varchar(255) DEFAULT NULL,
  `combination` tinyint(1) NOT NULL DEFAULT 0,
  `dosage_form` int(11) DEFAULT NULL,
  `maximum_daily_dose` double DEFAULT NULL,
  `minimum_daily_dose` double DEFAULT NULL,
  `route` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `strength` varchar(255) DEFAULT NULL,
  `dose_limit_units` int(11) DEFAULT NULL,
  PRIMARY KEY (`drug_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `dosage_form_concept` (`dosage_form`),
  KEY `drug_changed_by` (`changed_by`),
  KEY `drug_creator` (`creator`),
  KEY `drug_dose_limit_units_fk` (`dose_limit_units`),
  KEY `drug_retired_by` (`retired_by`),
  KEY `primary_drug_concept` (`concept_id`),
  KEY `route_concept` (`route`),
  CONSTRAINT `dosage_form_concept` FOREIGN KEY (`dosage_form`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `drug_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `drug_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `drug_dose_limit_units_fk` FOREIGN KEY (`dose_limit_units`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `drug_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `primary_drug_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `route_concept` FOREIGN KEY (`route`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `drug_ingredient`;
CREATE TABLE `drug_ingredient` (
  `drug_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL,
  `uuid` char(38) NOT NULL,
  `strength` double DEFAULT NULL,
  `units` int(11) DEFAULT NULL,
  PRIMARY KEY (`drug_id`,`ingredient_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `drug_ingredient_ingredient_id_fk` (`ingredient_id`),
  KEY `drug_ingredient_units_fk` (`units`),
  CONSTRAINT `drug_ingredient_drug_id_fk` FOREIGN KEY (`drug_id`) REFERENCES `drug` (`drug_id`),
  CONSTRAINT `drug_ingredient_ingredient_id_fk` FOREIGN KEY (`ingredient_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `drug_ingredient_units_fk` FOREIGN KEY (`units`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `drug_order`;
CREATE TABLE `drug_order` (
  `order_id` int(11) NOT NULL DEFAULT 0,
  `drug_inventory_id` int(11) DEFAULT NULL,
  `dose` double DEFAULT NULL,
  `as_needed` tinyint(1) DEFAULT 0,
  `dosing_type` varchar(255) DEFAULT NULL,
  `quantity` double DEFAULT NULL,
  `as_needed_condition` varchar(255) DEFAULT NULL,
  `num_refills` int(11) DEFAULT NULL,
  `dosing_instructions` text DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `duration_units` int(11) DEFAULT NULL,
  `quantity_units` int(11) DEFAULT NULL,
  `route` int(11) DEFAULT NULL,
  `dose_units` int(11) DEFAULT NULL,
  `frequency` int(11) DEFAULT NULL,
  `brand_name` varchar(255) DEFAULT NULL,
  `dispense_as_written` tinyint(1) NOT NULL DEFAULT 0,
  `drug_non_coded` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `drug_order_dose_units` (`dose_units`),
  KEY `drug_order_duration_units_fk` (`duration_units`),
  KEY `drug_order_frequency_fk` (`frequency`),
  KEY `drug_order_quantity_units` (`quantity_units`),
  KEY `drug_order_route_fk` (`route`),
  KEY `inventory_item` (`drug_inventory_id`),
  CONSTRAINT `drug_order_dose_units` FOREIGN KEY (`dose_units`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `drug_order_duration_units_fk` FOREIGN KEY (`duration_units`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `drug_order_frequency_fk` FOREIGN KEY (`frequency`) REFERENCES `order_frequency` (`order_frequency_id`),
  CONSTRAINT `drug_order_quantity_units` FOREIGN KEY (`quantity_units`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `drug_order_route_fk` FOREIGN KEY (`route`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `extends_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `inventory_item` FOREIGN KEY (`drug_inventory_id`) REFERENCES `drug` (`drug_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `drug_reference_map`;
CREATE TABLE `drug_reference_map` (
  `drug_reference_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `drug_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `concept_map_type` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`drug_reference_map_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_map_type_for_drug_reference_map` (`concept_map_type`),
  KEY `concept_reference_term_for_drug_reference_map` (`term_id`),
  KEY `drug_for_drug_reference_map` (`drug_id`),
  KEY `drug_reference_map_creator` (`creator`),
  KEY `user_who_changed_drug_reference_map` (`changed_by`),
  KEY `user_who_retired_drug_reference_map` (`retired_by`),
  CONSTRAINT `concept_map_type_for_drug_reference_map` FOREIGN KEY (`concept_map_type`) REFERENCES `concept_map_type` (`concept_map_type_id`),
  CONSTRAINT `concept_reference_term_for_drug_reference_map` FOREIGN KEY (`term_id`) REFERENCES `concept_reference_term` (`concept_reference_term_id`),
  CONSTRAINT `drug_for_drug_reference_map` FOREIGN KEY (`drug_id`) REFERENCES `drug` (`drug_id`),
  CONSTRAINT `drug_reference_map_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_changed_drug_reference_map` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_drug_reference_map` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `emrapi_procedure`;
CREATE TABLE `emrapi_procedure` (
  `procedure_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `procedure_type_id` int(11) NOT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  `procedure_coded` int(11) DEFAULT NULL,
  `procedure_non_coded` varchar(255) DEFAULT NULL,
  `body_site_coded` int(11) NOT NULL,
  `start_date_time` datetime NOT NULL,
  `estimated_start_date` varchar(35) DEFAULT NULL,
  `end_date_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `duration_unit_coded` int(11) DEFAULT NULL,
  `status_coded` int(11) NOT NULL,
  `outcome_coded` int(11) DEFAULT NULL,
  `outcome_non_coded` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `form_namespace_and_path` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`procedure_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_procedure_type` (`procedure_type_id`),
  KEY `fk_procedure_encounter` (`encounter_id`),
  KEY `fk_procedure_coded` (`procedure_coded`),
  KEY `fk_procedure_body_site` (`body_site_coded`),
  KEY `fk_procedure_duration_unit_coded` (`duration_unit_coded`),
  KEY `fk_procedure_outcome` (`outcome_coded`),
  KEY `fk_procedure_creator` (`creator`),
  KEY `fk_procedure_changed_by` (`changed_by`),
  KEY `fk_procedure_voided_by` (`voided_by`),
  KEY `idx_procedure_patient_voided_startdate` (`patient_id`,`voided`,`start_date_time`),
  CONSTRAINT `fk_procedure_body_site` FOREIGN KEY (`body_site_coded`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `fk_procedure_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_procedure_coded` FOREIGN KEY (`procedure_coded`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `fk_procedure_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_procedure_duration_unit_coded` FOREIGN KEY (`duration_unit_coded`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `fk_procedure_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `fk_procedure_outcome` FOREIGN KEY (`outcome_coded`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `fk_procedure_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `fk_procedure_type` FOREIGN KEY (`procedure_type_id`) REFERENCES `emrapi_procedure_type` (`procedure_type_id`),
  CONSTRAINT `fk_procedure_voided_by` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `emrapi_procedure_type`;
CREATE TABLE `emrapi_procedure_type` (
  `procedure_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`procedure_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_procedure_type_creator` (`creator`),
  KEY `fk_procedure_type_changed_by` (`changed_by`),
  KEY `fk_procedure_type_retired_by` (`retired_by`),
  CONSTRAINT `fk_procedure_type_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_procedure_type_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_procedure_type_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `encounter`;
CREATE TABLE `encounter` (
  `encounter_id` int(11) NOT NULL AUTO_INCREMENT,
  `encounter_type` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL DEFAULT 0,
  `location_id` int(11) DEFAULT NULL,
  `form_id` int(11) DEFAULT NULL,
  `encounter_datetime` datetime NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `visit_id` int(11) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`encounter_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `encounter_changed_by` (`changed_by`),
  KEY `encounter_datetime_idx` (`encounter_datetime`),
  KEY `encounter_form` (`form_id`),
  KEY `encounter_ibfk_1` (`creator`),
  KEY `encounter_location` (`location_id`),
  KEY `encounter_patient` (`patient_id`),
  KEY `encounter_type_id` (`encounter_type`),
  KEY `encounter_visit_id_fk` (`visit_id`),
  KEY `user_who_voided_encounter` (`voided_by`),
  CONSTRAINT `encounter_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_form` FOREIGN KEY (`form_id`) REFERENCES `form` (`form_id`),
  CONSTRAINT `encounter_ibfk_1` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `encounter_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `encounter_type_id` FOREIGN KEY (`encounter_type`) REFERENCES `encounter_type` (`encounter_type_id`),
  CONSTRAINT `encounter_visit_id_fk` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`),
  CONSTRAINT `user_who_voided_encounter` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `encounter_diagnosis`;
CREATE TABLE `encounter_diagnosis` (
  `diagnosis_id` int(11) NOT NULL AUTO_INCREMENT,
  `diagnosis_coded` int(11) DEFAULT NULL,
  `diagnosis_non_coded` varchar(255) DEFAULT NULL,
  `diagnosis_coded_name` int(11) DEFAULT NULL,
  `encounter_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `condition_id` int(11) DEFAULT NULL,
  `certainty` varchar(255) NOT NULL,
  `dx_rank` int(11) NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `form_namespace_and_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`diagnosis_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `encounter_diagnosis_changed_by_fk` (`changed_by`),
  KEY `encounter_diagnosis_coded_fk` (`diagnosis_coded`),
  KEY `encounter_diagnosis_coded_name_fk` (`diagnosis_coded_name`),
  KEY `encounter_diagnosis_condition_id_fk` (`condition_id`),
  KEY `encounter_diagnosis_creator_fk` (`creator`),
  KEY `encounter_diagnosis_encounter_id_fk` (`encounter_id`),
  KEY `encounter_diagnosis_patient_fk` (`patient_id`),
  KEY `encounter_diagnosis_voided_by_fk` (`voided_by`),
  CONSTRAINT `encounter_diagnosis_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_diagnosis_coded_fk` FOREIGN KEY (`diagnosis_coded`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `encounter_diagnosis_coded_name_fk` FOREIGN KEY (`diagnosis_coded_name`) REFERENCES `concept_name` (`concept_name_id`),
  CONSTRAINT `encounter_diagnosis_condition_id_fk` FOREIGN KEY (`condition_id`) REFERENCES `conditions` (`condition_id`),
  CONSTRAINT `encounter_diagnosis_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_diagnosis_encounter_id_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `encounter_diagnosis_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `encounter_diagnosis_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `encounter_provider`;
CREATE TABLE `encounter_provider` (
  `encounter_provider_id` int(11) NOT NULL AUTO_INCREMENT,
  `encounter_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `encounter_role_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`encounter_provider_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `encounter_id_fk` (`encounter_id`),
  KEY `encounter_provider_changed_by` (`changed_by`),
  KEY `encounter_provider_creator` (`creator`),
  KEY `encounter_provider_voided_by` (`voided_by`),
  KEY `encounter_role_id_fk` (`encounter_role_id`),
  KEY `provider_id_fk` (`provider_id`),
  CONSTRAINT `encounter_id_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `encounter_provider_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_provider_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_provider_voided_by` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_role_id_fk` FOREIGN KEY (`encounter_role_id`) REFERENCES `encounter_role` (`encounter_role_id`),
  CONSTRAINT `provider_id_fk` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `encounter_role`;
CREATE TABLE `encounter_role` (
  `encounter_role_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`encounter_role_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `encounter_role_changed_by_fk` (`changed_by`),
  KEY `encounter_role_creator_fk` (`creator`),
  KEY `encounter_role_retired_by_fk` (`retired_by`),
  CONSTRAINT `encounter_role_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_role_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `encounter_role_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `encounter_type`;
CREATE TABLE `encounter_type` (
  `encounter_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `edit_privilege` varchar(255) DEFAULT NULL,
  `view_privilege` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  PRIMARY KEY (`encounter_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `encounter_type_changed_by` (`changed_by`),
  KEY `encounter_type_retired_status` (`retired`),
  KEY `privilege_which_can_edit_encounter_type` (`edit_privilege`),
  KEY `privilege_which_can_view_encounter_type` (`view_privilege`),
  KEY `user_who_created_type` (`creator`),
  KEY `user_who_retired_encounter_type` (`retired_by`),
  CONSTRAINT `encounter_type_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `privilege_which_can_edit_encounter_type` FOREIGN KEY (`edit_privilege`) REFERENCES `privilege` (`privilege`),
  CONSTRAINT `privilege_which_can_view_encounter_type` FOREIGN KEY (`view_privilege`) REFERENCES `privilege` (`privilege`),
  CONSTRAINT `user_who_created_type` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_encounter_type` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_concept_source`;
CREATE TABLE `fhir_concept_source` (
  `fhir_concept_source_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_source_id` int(11) DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  PRIMARY KEY (`fhir_concept_source_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_concept_source_concept_reference_source_fk` (`concept_source_id`),
  KEY `fhir_concept_source_creator_fk` (`creator`),
  KEY `fhir_concept_source_changed_by_fk` (`changed_by`),
  KEY `fhir_concept_source_retired_by_fk` (`retired_by`),
  CONSTRAINT `fhir_concept_source_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_concept_source_concept_reference_source_fk` FOREIGN KEY (`concept_source_id`) REFERENCES `concept_reference_source` (`concept_source_id`),
  CONSTRAINT `fhir_concept_source_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_concept_source_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_contact_point_map`;
CREATE TABLE `fhir_contact_point_map` (
  `fhir_contact_point_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `attribute_type_domain` varchar(100) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `rank` int(11) DEFAULT NULL,
  `system` varchar(50) DEFAULT NULL,
  `use` varchar(50) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  PRIMARY KEY (`fhir_contact_point_map_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_contact_point_map_creator_fk` (`creator`),
  KEY `fhir_contact_point_map_changed_by_fk` (`changed_by`),
  KEY `fhir_contact_point_map_voided_by_fk` (`voided_by`),
  KEY `fhir_contact_point_map_attribute_type_domain_id` (`attribute_type_domain`,`attribute_type_id`),
  CONSTRAINT `fhir_contact_point_map_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_contact_point_map_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_contact_point_map_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_diagnostic_report`;
CREATE TABLE `fhir_diagnostic_report` (
  `diagnostic_report_id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  `concept_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `issued` datetime DEFAULT NULL,
  `conclusion` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`diagnostic_report_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_diagnostic_report_creator` (`creator`),
  KEY `fhir_diagnostic_report_changed_by` (`changed_by`),
  KEY `fhir_diagnostic_report_voided_by` (`voided_by`),
  KEY `fhir_diagnostic_report_code` (`concept_id`),
  KEY `fhir_diagnostic_report_subject` (`subject_id`),
  KEY `fhir_diagnostic_report_encounter` (`encounter_id`),
  CONSTRAINT `fhir_diagnostic_report_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_diagnostic_report_code` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `fhir_diagnostic_report_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_diagnostic_report_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `fhir_diagnostic_report_subject` FOREIGN KEY (`subject_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `fhir_diagnostic_report_voided_by` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_diagnostic_report_performers`;
CREATE TABLE `fhir_diagnostic_report_performers` (
  `diagnostic_report_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  PRIMARY KEY (`diagnostic_report_id`,`provider_id`),
  KEY `fhir_diagnostic_report_performers_reference` (`provider_id`),
  CONSTRAINT `fhir_diagnostic_report_performers_diagnostic_report` FOREIGN KEY (`diagnostic_report_id`) REFERENCES `fhir_diagnostic_report` (`diagnostic_report_id`),
  CONSTRAINT `fhir_diagnostic_report_performers_reference` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_diagnostic_report_results`;
CREATE TABLE `fhir_diagnostic_report_results` (
  `diagnostic_report_id` int(11) NOT NULL,
  `obs_id` int(11) NOT NULL,
  PRIMARY KEY (`diagnostic_report_id`,`obs_id`),
  KEY `fhir_diagnostic_report_results_reference` (`obs_id`),
  CONSTRAINT `fhir_diagnostic_report_results_diagnostic_report` FOREIGN KEY (`diagnostic_report_id`) REFERENCES `fhir_diagnostic_report` (`diagnostic_report_id`),
  CONSTRAINT `fhir_diagnostic_report_results_reference` FOREIGN KEY (`obs_id`) REFERENCES `obs` (`obs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_diagnostic_report_service_request`;
CREATE TABLE `fhir_diagnostic_report_service_request` (
  `diagnostic_report_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  PRIMARY KEY (`diagnostic_report_id`,`order_id`),
  KEY `fhir_diagnostic_report_service_request_order` (`order_id`),
  CONSTRAINT `fhir_diagnostic_report_service_request_diagnostic_report` FOREIGN KEY (`diagnostic_report_id`) REFERENCES `fhir_diagnostic_report` (`diagnostic_report_id`),
  CONSTRAINT `fhir_diagnostic_report_service_request_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_encounter_class_map`;
CREATE TABLE `fhir_encounter_class_map` (
  `encounter_class_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) DEFAULT NULL,
  `encounter_class` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retired_reason` varchar(255) DEFAULT NULL,
  `uuid` char(36) NOT NULL,
  PRIMARY KEY (`encounter_class_map_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_encounter_class_map_creator` (`creator`),
  KEY `fhir_encounter_class_map_changed_by` (`changed_by`),
  KEY `fhir_encounter_class_map_retired_by` (`retired_by`),
  KEY `fhir_encounter_class_map_location` (`location_id`),
  CONSTRAINT `fhir_encounter_class_map_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_encounter_class_map_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_encounter_class_map_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `fhir_encounter_class_map_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_observation_category_map`;
CREATE TABLE `fhir_observation_category_map` (
  `observation_category_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_class_id` int(11) DEFAULT NULL,
  `observation_category` varchar(255) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retired_reason` varchar(255) DEFAULT NULL,
  `uuid` char(36) NOT NULL,
  PRIMARY KEY (`observation_category_map_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_observation_category_map_creator` (`creator`),
  KEY `fhir_observation_category_map_changed_by` (`changed_by`),
  KEY `fhir_observation_category_map_retired_by` (`retired_by`),
  KEY `fhir_observation_category_map_concept_class` (`concept_class_id`),
  KEY `fhir_observation_category_map_observation_category` (`observation_category`),
  CONSTRAINT `fhir_observation_category_map_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_observation_category_map_concept_class` FOREIGN KEY (`concept_class_id`) REFERENCES `concept_class` (`concept_class_id`),
  CONSTRAINT `fhir_observation_category_map_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_observation_category_map_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_patient_identifier_system`;
CREATE TABLE `fhir_patient_identifier_system` (
  `fhir_patient_identifier_system_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_identifier_type_id` int(11) DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  PRIMARY KEY (`fhir_patient_identifier_system_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_patient_identifier_system_patient_identifier_type_fk` (`patient_identifier_type_id`),
  KEY `fhir_patient_identifier_system_creator_fk` (`creator`),
  KEY `fhir_patient_identifier_system_changed_by_fk` (`changed_by`),
  KEY `fhir_patient_identifier_system_retired_by_fk` (`retired_by`),
  CONSTRAINT `fhir_patient_identifier_system_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_patient_identifier_system_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_patient_identifier_system_patient_identifier_type_fk` FOREIGN KEY (`patient_identifier_type_id`) REFERENCES `patient_identifier_type` (`patient_identifier_type_id`),
  CONSTRAINT `fhir_patient_identifier_system_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_reference`;
CREATE TABLE `fhir_reference` (
  `reference_id` int(11) NOT NULL AUTO_INCREMENT,
  `target_type` varchar(255) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  `target_uuid` char(38) DEFAULT NULL,
  PRIMARY KEY (`reference_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_reference_creator_fk` (`creator`),
  KEY `fhir_reference_changed_by_fk` (`changed_by`),
  KEY `fhir_reference_retired_by_fk` (`retired_by`),
  CONSTRAINT `fhir_reference_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_reference_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_reference_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_task`;
CREATE TABLE `fhir_task` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(255) NOT NULL DEFAULT 'UNKNOWN',
  `status_reason` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `intent` varchar(255) NOT NULL,
  `owner_reference_id` int(11) DEFAULT NULL,
  `encounter_reference_id` int(11) DEFAULT NULL,
  `for_reference_id` int(11) DEFAULT NULL,
  `based_on` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `location_reference_id` int(11) DEFAULT NULL,
  `execution_start_time` datetime DEFAULT NULL,
  `execution_end_time` datetime DEFAULT NULL,
  `task_code` int(11) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `focus_reference_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `task_creator` (`creator`),
  KEY `task_changed_by` (`changed_by`),
  KEY `fhir_task_retired_by_fk` (`retired_by`),
  KEY `task_owner_reference_fk` (`owner_reference_id`),
  KEY `task_for_reference_fk` (`for_reference_id`),
  KEY `task_encounter_reference_fk` (`encounter_reference_id`),
  KEY `task_location_reference_fk` (`location_reference_id`),
  KEY `task_code_fk` (`task_code`),
  KEY `task_focus_reference_fk` (`focus_reference_id`),
  CONSTRAINT `fhir_task_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `task_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `task_code_fk` FOREIGN KEY (`task_code`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `task_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `task_encounter_reference_fk` FOREIGN KEY (`encounter_reference_id`) REFERENCES `fhir_reference` (`reference_id`),
  CONSTRAINT `task_focus_reference_fk` FOREIGN KEY (`focus_reference_id`) REFERENCES `fhir_reference` (`reference_id`),
  CONSTRAINT `task_for_reference_fk` FOREIGN KEY (`for_reference_id`) REFERENCES `fhir_reference` (`reference_id`),
  CONSTRAINT `task_location_reference_fk` FOREIGN KEY (`location_reference_id`) REFERENCES `fhir_reference` (`reference_id`),
  CONSTRAINT `task_owner_reference_fk` FOREIGN KEY (`owner_reference_id`) REFERENCES `fhir_reference` (`reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_task_based_on_reference`;
CREATE TABLE `fhir_task_based_on_reference` (
  `task_id` int(11) NOT NULL,
  `reference_id` int(11) NOT NULL,
  UNIQUE KEY `reference_id` (`reference_id`),
  KEY `task_based_on_fk` (`task_id`),
  CONSTRAINT `reference_based_on_fk` FOREIGN KEY (`reference_id`) REFERENCES `fhir_reference` (`reference_id`),
  CONSTRAINT `task_based_on_fk` FOREIGN KEY (`task_id`) REFERENCES `fhir_task` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_task_input`;
CREATE TABLE `fhir_task_input` (
  `task_input_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `value_datetime` datetime DEFAULT NULL,
  `value_numeric` double DEFAULT NULL,
  `value_text` varchar(255) DEFAULT NULL,
  `value_reference_id` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  PRIMARY KEY (`task_input_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_task_input_creator_fk` (`creator`),
  KEY `fhir_task_input_changed_by_fk` (`changed_by`),
  KEY `fhir_task_input_retired_by_fk` (`retired_by`),
  KEY `input_type_fk` (`type_id`),
  KEY `input_reference_fk` (`value_reference_id`),
  KEY `input_task_fk` (`task_id`),
  CONSTRAINT `fhir_task_input_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_task_input_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_task_input_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `input_reference_fk` FOREIGN KEY (`value_reference_id`) REFERENCES `fhir_reference` (`reference_id`),
  CONSTRAINT `input_task_fk` FOREIGN KEY (`task_id`) REFERENCES `fhir_task` (`task_id`),
  CONSTRAINT `input_type_fk` FOREIGN KEY (`type_id`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_task_output`;
CREATE TABLE `fhir_task_output` (
  `task_output_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) DEFAULT NULL,
  `type_id` int(11) NOT NULL,
  `value_datetime` datetime DEFAULT NULL,
  `value_numeric` double DEFAULT NULL,
  `value_text` varchar(255) DEFAULT NULL,
  `value_reference_id` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  PRIMARY KEY (`task_output_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fhir_task_output_creator_fk` (`creator`),
  KEY `fhir_task_output_changed_by_fk` (`changed_by`),
  KEY `fhir_task_output_retired_by_fk` (`retired_by`),
  KEY `output_type_fk` (`type_id`),
  KEY `output_reference_fk` (`value_reference_id`),
  KEY `output_task_fk` (`task_id`),
  CONSTRAINT `fhir_task_output_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_task_output_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fhir_task_output_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `output_reference_fk` FOREIGN KEY (`value_reference_id`) REFERENCES `fhir_reference` (`reference_id`),
  CONSTRAINT `output_task_fk` FOREIGN KEY (`task_id`) REFERENCES `fhir_task` (`task_id`),
  CONSTRAINT `output_type_fk` FOREIGN KEY (`type_id`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `fhir_task_part_of_reference`;
CREATE TABLE `fhir_task_part_of_reference` (
  `task_id` int(11) NOT NULL,
  `reference_id` int(11) NOT NULL,
  KEY `task_part_of_fk` (`task_id`),
  KEY `reference_part_of_fk` (`reference_id`),
  CONSTRAINT `reference_part_of_fk` FOREIGN KEY (`reference_id`) REFERENCES `fhir_reference` (`reference_id`),
  CONSTRAINT `task_part_of_fk` FOREIGN KEY (`task_id`) REFERENCES `fhir_task` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `field`;
CREATE TABLE `field` (
  `field_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `field_type` int(11) DEFAULT NULL,
  `concept_id` int(11) DEFAULT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `attribute_name` varchar(50) DEFAULT NULL,
  `default_value` text DEFAULT NULL,
  `select_multiple` tinyint(1) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`field_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `concept_for_field` (`concept_id`),
  KEY `field_retired_status` (`retired`),
  KEY `type_of_field` (`field_type`),
  KEY `user_who_changed_field` (`changed_by`),
  KEY `user_who_created_field` (`creator`),
  KEY `user_who_retired_field` (`retired_by`),
  CONSTRAINT `concept_for_field` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `type_of_field` FOREIGN KEY (`field_type`) REFERENCES `field_type` (`field_type_id`),
  CONSTRAINT `user_who_changed_field` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_created_field` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_field` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `field_answer`;
CREATE TABLE `field_answer` (
  `field_id` int(11) NOT NULL DEFAULT 0,
  `answer_id` int(11) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`field_id`,`answer_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `field_answer_concept` (`answer_id`),
  KEY `user_who_created_field_answer` (`creator`),
  CONSTRAINT `answers_for_field` FOREIGN KEY (`field_id`) REFERENCES `field` (`field_id`),
  CONSTRAINT `field_answer_concept` FOREIGN KEY (`answer_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `user_who_created_field_answer` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `field_type`;
CREATE TABLE `field_type` (
  `field_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_set` tinyint(1) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`field_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `user_who_created_field_type` (`creator`),
  CONSTRAINT `user_who_created_field_type` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `form`;
CREATE TABLE `form` (
  `form_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `version` varchar(50) NOT NULL DEFAULT '',
  `build` int(11) DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `xslt` text DEFAULT NULL,
  `template` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `encounter_type` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retired_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`form_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `form_encounter_type` (`encounter_type`),
  KEY `form_published_and_retired_index` (`published`,`retired`),
  KEY `form_published_index` (`published`),
  KEY `form_retired_index` (`retired`),
  KEY `user_who_created_form` (`creator`),
  KEY `user_who_last_changed_form` (`changed_by`),
  KEY `user_who_retired_form` (`retired_by`),
  CONSTRAINT `form_encounter_type` FOREIGN KEY (`encounter_type`) REFERENCES `encounter_type` (`encounter_type_id`),
  CONSTRAINT `user_who_created_form` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_last_changed_form` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_form` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `form_field`;
CREATE TABLE `form_field` (
  `form_field_id` int(11) NOT NULL AUTO_INCREMENT,
  `form_id` int(11) NOT NULL DEFAULT 0,
  `field_id` int(11) NOT NULL DEFAULT 0,
  `field_number` int(11) DEFAULT NULL,
  `field_part` varchar(5) DEFAULT NULL,
  `page_number` int(11) DEFAULT NULL,
  `parent_form_field` int(11) DEFAULT NULL,
  `min_occurs` int(11) DEFAULT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `sort_weight` float DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`form_field_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `field_within_form` (`field_id`),
  KEY `form_containing_field` (`form_id`),
  KEY `form_field_hierarchy` (`parent_form_field`),
  KEY `user_who_created_form_field` (`creator`),
  KEY `user_who_last_changed_form_field` (`changed_by`),
  CONSTRAINT `field_within_form` FOREIGN KEY (`field_id`) REFERENCES `field` (`field_id`),
  CONSTRAINT `form_containing_field` FOREIGN KEY (`form_id`) REFERENCES `form` (`form_id`),
  CONSTRAINT `form_field_hierarchy` FOREIGN KEY (`parent_form_field`) REFERENCES `form_field` (`form_field_id`),
  CONSTRAINT `user_who_created_form_field` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_last_changed_form_field` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `form_resource`;
CREATE TABLE `form_resource` (
  `form_resource_id` int(11) NOT NULL AUTO_INCREMENT,
  `form_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value_reference` text NOT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`form_resource_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `unique_form_and_name` (`form_id`,`name`),
  KEY `form_resource_changed_by` (`changed_by`),
  CONSTRAINT `form_resource_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `form_resource_form_fk` FOREIGN KEY (`form_id`) REFERENCES `form` (`form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `global_property`;
CREATE TABLE `global_property` (
  `property` varchar(255) NOT NULL DEFAULT '',
  `property_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `view_privilege` varchar(255) DEFAULT NULL,
  `edit_privilege` varchar(255) DEFAULT NULL,
  `delete_privilege` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`property`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `global_property_changed_by` (`changed_by`),
  KEY `global_property_delete_privilege_fk` (`delete_privilege`),
  KEY `global_property_edit_privilege_fk` (`edit_privilege`),
  KEY `global_property_view_privilege_fk` (`view_privilege`),
  CONSTRAINT `global_property_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `global_property_delete_privilege_fk` FOREIGN KEY (`delete_privilege`) REFERENCES `privilege` (`privilege`),
  CONSTRAINT `global_property_edit_privilege_fk` FOREIGN KEY (`edit_privilege`) REFERENCES `privilege` (`privilege`),
  CONSTRAINT `global_property_view_privilege_fk` FOREIGN KEY (`view_privilege`) REFERENCES `privilege` (`privilege`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `hl7_in_archive`;
CREATE TABLE `hl7_in_archive` (
  `hl7_in_archive_id` int(11) NOT NULL AUTO_INCREMENT,
  `hl7_source` int(11) NOT NULL DEFAULT 0,
  `hl7_source_key` varchar(255) DEFAULT NULL,
  `hl7_data` text NOT NULL,
  `date_created` datetime NOT NULL,
  `message_state` int(11) DEFAULT 2,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`hl7_in_archive_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `hl7_in_archive_message_state_idx` (`message_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `hl7_in_error`;
CREATE TABLE `hl7_in_error` (
  `hl7_in_error_id` int(11) NOT NULL AUTO_INCREMENT,
  `hl7_source` int(11) NOT NULL DEFAULT 0,
  `hl7_source_key` text DEFAULT NULL,
  `hl7_data` text NOT NULL,
  `error` varchar(255) NOT NULL DEFAULT '',
  `error_details` mediumtext DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`hl7_in_error_id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `hl7_in_queue`;
CREATE TABLE `hl7_in_queue` (
  `hl7_in_queue_id` int(11) NOT NULL AUTO_INCREMENT,
  `hl7_source` int(11) NOT NULL DEFAULT 0,
  `hl7_source_key` text DEFAULT NULL,
  `hl7_data` text NOT NULL,
  `message_state` int(11) NOT NULL DEFAULT 0,
  `date_processed` datetime DEFAULT NULL,
  `error_msg` text DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`hl7_in_queue_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `hl7_source_with_queue` (`hl7_source`),
  CONSTRAINT `hl7_source_with_queue` FOREIGN KEY (`hl7_source`) REFERENCES `hl7_source` (`hl7_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `hl7_source`;
CREATE TABLE `hl7_source` (
  `hl7_source_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`hl7_source_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `user_who_created_hl7_source` (`creator`),
  CONSTRAINT `user_who_created_hl7_source` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `idgen_auto_generation_option`;
CREATE TABLE `idgen_auto_generation_option` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier_type` int(11) NOT NULL,
  `source` int(11) NOT NULL,
  `manual_entry_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `automatic_generation_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `location` int(11) DEFAULT NULL,
  `uuid` char(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idgen_auto_generation_option_uuid_index` (`uuid`),
  KEY `source for idgen_auto_generation_option` (`source`),
  KEY `location_for_auto_generation_option` (`location`),
  KEY `identifier_type for idgen_auto_generation_option` (`identifier_type`),
  CONSTRAINT `identifier_type for idgen_auto_generation_option` FOREIGN KEY (`identifier_type`) REFERENCES `patient_identifier_type` (`patient_identifier_type_id`),
  CONSTRAINT `location_for_auto_generation_option` FOREIGN KEY (`location`) REFERENCES `location` (`location_id`),
  CONSTRAINT `source for idgen_auto_generation_option` FOREIGN KEY (`source`) REFERENCES `idgen_identifier_source` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `idgen_identifier_source`;
CREATE TABLE `idgen_identifier_source` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `identifier_type` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `identifier_type for idgen_identifier_source` (`identifier_type`),
  KEY `creator for idgen_identifier_source` (`creator`),
  KEY `changed_by for idgen_identifier_source` (`changed_by`),
  KEY `retired_by for idgen_identifier_source` (`retired_by`),
  CONSTRAINT `changed_by for idgen_identifier_source` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `creator for idgen_identifier_source` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `identifier_type for idgen_identifier_source` FOREIGN KEY (`identifier_type`) REFERENCES `patient_identifier_type` (`patient_identifier_type_id`),
  CONSTRAINT `retired_by for idgen_identifier_source` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `idgen_id_pool`;
CREATE TABLE `idgen_id_pool` (
  `id` int(11) NOT NULL,
  `source` int(11) DEFAULT NULL,
  `batch_size` int(11) DEFAULT NULL,
  `min_pool_size` int(11) DEFAULT NULL,
  `sequential` tinyint(1) NOT NULL DEFAULT 0,
  `refill_with_scheduled_task` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `source for idgen_id_pool` (`source`),
  CONSTRAINT `id for idgen_id_pool` FOREIGN KEY (`id`) REFERENCES `idgen_identifier_source` (`id`),
  CONSTRAINT `source for idgen_id_pool` FOREIGN KEY (`source`) REFERENCES `idgen_identifier_source` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `idgen_log_entry`;
CREATE TABLE `idgen_log_entry` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source` int(11) NOT NULL,
  `identifier` varchar(50) NOT NULL,
  `date_generated` datetime NOT NULL,
  `generated_by` int(11) NOT NULL,
  `comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `generated_by for idgen_log` (`generated_by`),
  KEY `source for idgen_log` (`source`),
  CONSTRAINT `generated_by for idgen_log` FOREIGN KEY (`generated_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `source for idgen_log` FOREIGN KEY (`source`) REFERENCES `idgen_identifier_source` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `idgen_pooled_identifier`;
CREATE TABLE `idgen_pooled_identifier` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `pool_id` int(11) NOT NULL,
  `identifier` varchar(50) NOT NULL,
  `date_used` datetime DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `pool_id for idgen_pooled_identifier` (`pool_id`),
  CONSTRAINT `pool_id for idgen_pooled_identifier` FOREIGN KEY (`pool_id`) REFERENCES `idgen_id_pool` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `idgen_remote_source`;
CREATE TABLE `idgen_remote_source` (
  `id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `user` varchar(50) DEFAULT NULL,
  `password` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `id for idgen_remote_source` FOREIGN KEY (`id`) REFERENCES `idgen_identifier_source` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `idgen_reserved_identifier`;
CREATE TABLE `idgen_reserved_identifier` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source` int(11) NOT NULL,
  `identifier` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `source for idgen_reserved_identifier` (`source`),
  CONSTRAINT `source for idgen_reserved_identifier` FOREIGN KEY (`source`) REFERENCES `idgen_identifier_source` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `idgen_seq_id_gen`;
CREATE TABLE `idgen_seq_id_gen` (
  `id` int(11) NOT NULL,
  `next_sequence_value` int(11) NOT NULL DEFAULT -1,
  `base_character_set` varchar(255) NOT NULL,
  `first_identifier_base` varchar(50) NOT NULL,
  `prefix` varchar(100) DEFAULT NULL,
  `suffix` varchar(100) DEFAULT NULL,
  `min_length` int(11) DEFAULT NULL,
  `max_length` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `id for idgen_seq_id_gen` FOREIGN KEY (`id`) REFERENCES `idgen_identifier_source` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `liquibasechangelog`;
CREATE TABLE `liquibasechangelog` (
  `ID` varchar(255) NOT NULL,
  `AUTHOR` varchar(255) NOT NULL,
  `FILENAME` varchar(255) NOT NULL,
  `DATEEXECUTED` datetime NOT NULL,
  `ORDEREXECUTED` int(11) NOT NULL,
  `EXECTYPE` varchar(10) NOT NULL,
  `MD5SUM` varchar(35) DEFAULT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `COMMENTS` varchar(255) DEFAULT NULL,
  `TAG` varchar(255) DEFAULT NULL,
  `LIQUIBASE` varchar(20) DEFAULT NULL,
  `CONTEXTS` varchar(255) DEFAULT NULL,
  `LABELS` varchar(255) DEFAULT NULL,
  `DEPLOYMENT_ID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `liquibasechangeloglock`;
CREATE TABLE `liquibasechangeloglock` (
  `ID` int(11) NOT NULL,
  `LOCKED` tinyint(1) NOT NULL,
  `LOCKGRANTED` datetime DEFAULT NULL,
  `LOCKEDBY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `location`;
CREATE TABLE `location` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(255) DEFAULT NULL,
  `address1` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `city_village` varchar(255) DEFAULT NULL,
  `state_province` varchar(255) DEFAULT NULL,
  `postal_code` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `county_district` varchar(255) DEFAULT NULL,
  `address3` varchar(255) DEFAULT NULL,
  `address4` varchar(255) DEFAULT NULL,
  `address5` varchar(255) DEFAULT NULL,
  `address6` varchar(255) DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `parent_location` int(11) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `address7` varchar(255) DEFAULT NULL,
  `address8` varchar(255) DEFAULT NULL,
  `address9` varchar(255) DEFAULT NULL,
  `address10` varchar(255) DEFAULT NULL,
  `address11` varchar(255) DEFAULT NULL,
  `address12` varchar(255) DEFAULT NULL,
  `address13` varchar(255) DEFAULT NULL,
  `address14` varchar(255) DEFAULT NULL,
  `address15` varchar(255) DEFAULT NULL,
  `location_type_concept_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `location_changed_by` (`changed_by`),
  KEY `location_retired_status` (`retired`),
  KEY `location_type_fk` (`location_type_concept_id`),
  KEY `name_of_location` (`name`),
  KEY `parent_location` (`parent_location`),
  KEY `user_who_created_location` (`creator`),
  KEY `user_who_retired_location` (`retired_by`),
  CONSTRAINT `location_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `location_type_fk` FOREIGN KEY (`location_type_concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `parent_location` FOREIGN KEY (`parent_location`) REFERENCES `location` (`location_id`),
  CONSTRAINT `user_who_created_location` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_location` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `location_attribute`;
CREATE TABLE `location_attribute` (
  `location_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`location_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `location_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `location_attribute_changed_by_fk` (`changed_by`),
  KEY `location_attribute_creator_fk` (`creator`),
  KEY `location_attribute_location_fk` (`location_id`),
  KEY `location_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `location_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `location_attribute_type` (`location_attribute_type_id`),
  CONSTRAINT `location_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `location_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `location_attribute_location_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `location_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `location_attribute_type`;
CREATE TABLE `location_attribute_type` (
  `location_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`location_attribute_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `location_attribute_type_changed_by_fk` (`changed_by`),
  KEY `location_attribute_type_creator_fk` (`creator`),
  KEY `location_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `location_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `location_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `location_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `location_tag`;
CREATE TABLE `location_tag` (
  `location_tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  PRIMARY KEY (`location_tag_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `location_tag_changed_by` (`changed_by`),
  KEY `location_tag_creator` (`creator`),
  KEY `location_tag_retired_by` (`retired_by`),
  CONSTRAINT `location_tag_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `location_tag_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `location_tag_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `location_tag_map`;
CREATE TABLE `location_tag_map` (
  `location_id` int(11) NOT NULL,
  `location_tag_id` int(11) NOT NULL,
  PRIMARY KEY (`location_id`,`location_tag_id`),
  KEY `location_tag_map_tag` (`location_tag_id`),
  CONSTRAINT `location_tag_map_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `location_tag_map_tag` FOREIGN KEY (`location_tag_id`) REFERENCES `location_tag` (`location_tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `medication_dispense`;
CREATE TABLE `medication_dispense` (
  `medication_dispense_id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  `concept` int(11) NOT NULL,
  `drug_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `dispenser` int(11) DEFAULT NULL,
  `drug_order_id` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL,
  `status_reason` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `quantity` double DEFAULT NULL,
  `quantity_units` int(11) DEFAULT NULL,
  `dose` double DEFAULT NULL,
  `dose_units` int(11) DEFAULT NULL,
  `route` int(11) DEFAULT NULL,
  `frequency` int(11) DEFAULT NULL,
  `as_needed` tinyint(1) DEFAULT NULL,
  `dosing_instructions` text DEFAULT NULL,
  `date_prepared` datetime DEFAULT NULL,
  `date_handed_over` datetime DEFAULT NULL,
  `was_substituted` tinyint(1) DEFAULT NULL,
  `substitution_type` int(11) DEFAULT NULL,
  `substitution_reason` int(11) DEFAULT NULL,
  `form_namespace_and_path` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`medication_dispense_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `medication_dispense_changed_by_fk` (`changed_by`),
  KEY `medication_dispense_concept_fk` (`concept`),
  KEY `medication_dispense_creator_fk` (`creator`),
  KEY `medication_dispense_dispenser_fk` (`dispenser`),
  KEY `medication_dispense_dose_units_fk` (`dose_units`),
  KEY `medication_dispense_drug_fk` (`drug_id`),
  KEY `medication_dispense_drug_order_fk` (`drug_order_id`),
  KEY `medication_dispense_encounter_fk` (`encounter_id`),
  KEY `medication_dispense_frequency_fk` (`frequency`),
  KEY `medication_dispense_location_fk` (`location_id`),
  KEY `medication_dispense_patient_fk` (`patient_id`),
  KEY `medication_dispense_quantity_units_fk` (`quantity_units`),
  KEY `medication_dispense_route_fk` (`route`),
  KEY `medication_dispense_status_fk` (`status`),
  KEY `medication_dispense_status_reason_fk` (`status_reason`),
  KEY `medication_dispense_substitution_reason_fk` (`substitution_reason`),
  KEY `medication_dispense_substitution_type_fk` (`substitution_type`),
  KEY `medication_dispense_type_fk` (`type`),
  KEY `medication_dispense_voided_by_fk` (`voided_by`),
  CONSTRAINT `medication_dispense_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `medication_dispense_concept_fk` FOREIGN KEY (`concept`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `medication_dispense_dispenser_fk` FOREIGN KEY (`dispenser`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `medication_dispense_dose_units_fk` FOREIGN KEY (`dose_units`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_drug_fk` FOREIGN KEY (`drug_id`) REFERENCES `drug` (`drug_id`),
  CONSTRAINT `medication_dispense_drug_order_fk` FOREIGN KEY (`drug_order_id`) REFERENCES `drug_order` (`order_id`),
  CONSTRAINT `medication_dispense_encounter_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `medication_dispense_frequency_fk` FOREIGN KEY (`frequency`) REFERENCES `order_frequency` (`order_frequency_id`),
  CONSTRAINT `medication_dispense_location_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `medication_dispense_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `medication_dispense_quantity_units_fk` FOREIGN KEY (`quantity_units`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_route_fk` FOREIGN KEY (`route`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_status_fk` FOREIGN KEY (`status`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_status_reason_fk` FOREIGN KEY (`status_reason`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_substitution_reason_fk` FOREIGN KEY (`substitution_reason`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_substitution_type_fk` FOREIGN KEY (`substitution_type`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_type_fk` FOREIGN KEY (`type`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `medication_dispense_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `metadatamapping_metadata_set`;
CREATE TABLE `metadatamapping_metadata_set` (
  `metadata_set_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `date_retired` datetime DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`metadata_set_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `metadatamapping_metadata_set_creator` (`creator`),
  KEY `metadatamapping_metadata_set_changed_by` (`changed_by`),
  KEY `metadatamapping_metadata_set_retired_by` (`retired_by`),
  CONSTRAINT `metadatamapping_metadata_set_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `metadatamapping_metadata_set_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `metadatamapping_metadata_set_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `metadatamapping_metadata_set_member`;
CREATE TABLE `metadatamapping_metadata_set_member` (
  `metadata_set_member_id` int(11) NOT NULL AUTO_INCREMENT,
  `metadata_set_id` int(11) NOT NULL,
  `metadata_class` varchar(1024) NOT NULL,
  `metadata_uuid` varchar(38) NOT NULL,
  `sort_weight` double DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `date_retired` datetime DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`metadata_set_member_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `metadatamapping_metadata_set_member_term_unique_within_set` (`metadata_set_id`,`metadata_uuid`),
  KEY `metadatamapping_metadata_set_member_creator` (`creator`),
  KEY `metadatamapping_metadata_set_member_changed_by` (`changed_by`),
  KEY `metadatamapping_metadata_set_member_retired_by` (`retired_by`),
  CONSTRAINT `metadatamapping_metadata_set_member_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `metadatamapping_metadata_set_member_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `metadatamapping_metadata_set_member_metadata_set_id` FOREIGN KEY (`metadata_set_id`) REFERENCES `metadatamapping_metadata_set` (`metadata_set_id`),
  CONSTRAINT `metadatamapping_metadata_set_member_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `metadatamapping_metadata_source`;
CREATE TABLE `metadatamapping_metadata_source` (
  `metadata_source_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `date_retired` datetime DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`metadata_source_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `metadatamapping_metadata_source_name_unique` (`name`),
  KEY `metadatamapping_metadata_source_creator` (`creator`),
  KEY `metadatamapping_metadata_source_changed_by` (`changed_by`),
  KEY `metadatamapping_metadata_source_retired_by` (`retired_by`),
  CONSTRAINT `metadatamapping_metadata_source_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `metadatamapping_metadata_source_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `metadatamapping_metadata_source_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `metadatamapping_metadata_term_mapping`;
CREATE TABLE `metadatamapping_metadata_term_mapping` (
  `metadata_term_mapping_id` int(11) NOT NULL AUTO_INCREMENT,
  `metadata_source_id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `metadata_class` varchar(1024) DEFAULT NULL,
  `metadata_uuid` varchar(38) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `date_retired` datetime DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`metadata_term_mapping_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `metadatamapping_metadata_term_code_unique_within_source` (`metadata_source_id`,`code`),
  KEY `metadatamapping_metadata_term_mapping_creator` (`creator`),
  KEY `metadatamapping_metadata_term_mapping_changed_by` (`changed_by`),
  KEY `metadatamapping_metadata_term_mapping_retired_by` (`retired_by`),
  KEY `metadatamapping_idx_mdtm_retired` (`retired`),
  KEY `metadatamapping_idx_mdtm_mdclass` (`metadata_class`(768)),
  KEY `metadatamapping_idx_mdtm_mdsource` (`metadata_source_id`),
  KEY `metadatamapping_idx_mdtm_code` (`code`),
  CONSTRAINT `metadatamapping_metadata_term_mapping_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `metadatamapping_metadata_term_mapping_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `metadatamapping_metadata_term_mapping_metadata_source_id` FOREIGN KEY (`metadata_source_id`) REFERENCES `metadatamapping_metadata_source` (`metadata_source_id`),
  CONSTRAINT `metadatamapping_metadata_term_mapping_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `note`;
CREATE TABLE `note` (
  `note_id` int(11) NOT NULL DEFAULT 0,
  `note_type` varchar(50) DEFAULT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `obs_id` int(11) DEFAULT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  `text` text NOT NULL,
  `priority` int(11) DEFAULT NULL,
  `parent` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`note_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `encounter_note` (`encounter_id`),
  KEY `note_hierarchy` (`parent`),
  KEY `obs_note` (`obs_id`),
  KEY `patient_note` (`patient_id`),
  KEY `user_who_changed_note` (`changed_by`),
  KEY `user_who_created_note` (`creator`),
  CONSTRAINT `encounter_note` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `note_hierarchy` FOREIGN KEY (`parent`) REFERENCES `note` (`note_id`),
  CONSTRAINT `obs_note` FOREIGN KEY (`obs_id`) REFERENCES `obs` (`obs_id`),
  CONSTRAINT `patient_note` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_who_changed_note` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_created_note` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `notification_alert`;
CREATE TABLE `notification_alert` (
  `alert_id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(512) NOT NULL,
  `satisfied_by_any` tinyint(1) NOT NULL DEFAULT 0,
  `alert_read` tinyint(1) NOT NULL DEFAULT 0,
  `date_to_expire` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`alert_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `alert_creator` (`creator`),
  KEY `alert_date_to_expire_idx` (`date_to_expire`),
  KEY `user_who_changed_alert` (`changed_by`),
  CONSTRAINT `alert_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_changed_alert` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `notification_alert_recipient`;
CREATE TABLE `notification_alert_recipient` (
  `alert_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `alert_read` tinyint(1) NOT NULL DEFAULT 0,
  `date_changed` timestamp NOT NULL DEFAULT current_timestamp(),
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`alert_id`,`user_id`),
  KEY `alert_read_by_user` (`user_id`),
  CONSTRAINT `alert_read_by_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `id_of_alert` FOREIGN KEY (`alert_id`) REFERENCES `notification_alert` (`alert_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `notification_template`;
CREATE TABLE `notification_template` (
  `template_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `template` text DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `recipients` varchar(512) DEFAULT NULL,
  `ordinal` int(11) DEFAULT 0,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`template_id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `obs`;
CREATE TABLE `obs` (
  `obs_id` int(11) NOT NULL AUTO_INCREMENT,
  `person_id` int(11) NOT NULL,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `encounter_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `obs_datetime` datetime NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `obs_group_id` int(11) DEFAULT NULL,
  `accession_number` varchar(255) DEFAULT NULL,
  `value_group_id` int(11) DEFAULT NULL,
  `value_coded` int(11) DEFAULT NULL,
  `value_coded_name_id` int(11) DEFAULT NULL,
  `value_drug` int(11) DEFAULT NULL,
  `value_datetime` datetime DEFAULT NULL,
  `value_numeric` double DEFAULT NULL,
  `value_modifier` varchar(2) DEFAULT NULL,
  `value_text` text DEFAULT NULL,
  `value_complex` varchar(1000) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `previous_version` int(11) DEFAULT NULL,
  `form_namespace_and_path` varchar(255) DEFAULT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'FINAL',
  `interpretation` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`obs_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `answer_concept` (`value_coded`),
  KEY `answer_concept_drug` (`value_drug`),
  KEY `encounter_observations` (`encounter_id`),
  KEY `obs_concept` (`concept_id`),
  KEY `obs_datetime_idx` (`obs_datetime`),
  KEY `obs_enterer` (`creator`),
  KEY `obs_grouping_id` (`obs_group_id`),
  KEY `obs_location` (`location_id`),
  KEY `obs_name_of_coded_value` (`value_coded_name_id`),
  KEY `obs_order` (`order_id`),
  KEY `person_obs` (`person_id`),
  KEY `previous_version` (`previous_version`),
  KEY `user_who_voided_obs` (`voided_by`),
  CONSTRAINT `answer_concept` FOREIGN KEY (`value_coded`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `answer_concept_drug` FOREIGN KEY (`value_drug`) REFERENCES `drug` (`drug_id`),
  CONSTRAINT `encounter_observations` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `obs_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `obs_enterer` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `obs_grouping_id` FOREIGN KEY (`obs_group_id`) REFERENCES `obs` (`obs_id`),
  CONSTRAINT `obs_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `obs_name_of_coded_value` FOREIGN KEY (`value_coded_name_id`) REFERENCES `concept_name` (`concept_name_id`),
  CONSTRAINT `obs_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `person_obs` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`) ON UPDATE CASCADE,
  CONSTRAINT `previous_version` FOREIGN KEY (`previous_version`) REFERENCES `obs` (`obs_id`),
  CONSTRAINT `user_who_voided_obs` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `obs_reference_range`;
CREATE TABLE `obs_reference_range` (
  `obs_reference_range_id` int(11) NOT NULL AUTO_INCREMENT,
  `obs_id` int(11) NOT NULL,
  `hi_absolute` double DEFAULT NULL,
  `hi_critical` double DEFAULT NULL,
  `hi_normal` double DEFAULT NULL,
  `low_absolute` double DEFAULT NULL,
  `low_critical` double DEFAULT NULL,
  `low_normal` double DEFAULT NULL,
  `uuid` char(38) DEFAULT NULL,
  PRIMARY KEY (`obs_reference_range_id`),
  UNIQUE KEY `obs_id` (`obs_id`),
  UNIQUE KEY `uuid` (`uuid`),
  CONSTRAINT `fk_obs_reference_range` FOREIGN KEY (`obs_id`) REFERENCES `obs` (`obs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `openconceptlab_import`;
CREATE TABLE `openconceptlab_import` (
  `import_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) DEFAULT NULL,
  `local_date_started` datetime NOT NULL,
  `local_date_stopped` datetime DEFAULT NULL,
  `ocl_date_started` datetime DEFAULT NULL,
  `error_message` varchar(1024) DEFAULT NULL,
  `release_version` varchar(512) DEFAULT NULL,
  `subscription_url` text DEFAULT NULL,
  PRIMARY KEY (`import_id`),
  KEY `openconceptlab_import_uuid` (`uuid`),
  KEY `openconceptlab_import_stopped` (`local_date_stopped`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `openconceptlab_item`;
CREATE TABLE `openconceptlab_item` (
  `item_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `import_id` bigint(20) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `uuid` char(38) DEFAULT NULL,
  `version_url` varchar(1024) DEFAULT NULL,
  `url` varchar(1024) DEFAULT NULL,
  `hashed_url` binary(16) DEFAULT NULL,
  `state` int(11) NOT NULL,
  `error_message` varchar(1024) DEFAULT NULL,
  `updated_on` datetime DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `openconceptlab_item_url` (`hashed_url`),
  KEY `openconceptlab_item_import_state` (`import_id`,`state`),
  KEY `openconceptlab_item_uuid` (`uuid`),
  KEY `openconceptlab_item_type_uuid` (`type`,`uuid`),
  CONSTRAINT `openconceptlab_item_import` FOREIGN KEY (`import_id`) REFERENCES `openconceptlab_import` (`import_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_type_id` int(11) NOT NULL DEFAULT 0,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `orderer` int(11) NOT NULL,
  `encounter_id` int(11) NOT NULL,
  `instructions` text DEFAULT NULL,
  `date_activated` datetime DEFAULT NULL,
  `auto_expire_date` datetime DEFAULT NULL,
  `date_stopped` datetime DEFAULT NULL,
  `order_reason` int(11) DEFAULT NULL,
  `order_reason_non_coded` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `patient_id` int(11) NOT NULL,
  `accession_number` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `urgency` varchar(50) NOT NULL DEFAULT 'ROUTINE',
  `order_number` varchar(50) NOT NULL,
  `previous_order_id` int(11) DEFAULT NULL,
  `order_action` varchar(50) NOT NULL,
  `comment_to_fulfiller` varchar(1024) DEFAULT NULL,
  `care_setting` int(11) NOT NULL,
  `scheduled_date` datetime DEFAULT NULL,
  `order_group_id` int(11) DEFAULT NULL,
  `sort_weight` double DEFAULT NULL,
  `fulfiller_comment` varchar(1024) DEFAULT NULL,
  `fulfiller_status` varchar(50) DEFAULT NULL,
  `form_namespace_and_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `discontinued_because` (`order_reason`),
  KEY `fk_orderer_provider` (`orderer`),
  KEY `order_creator` (`creator`),
  KEY `order_for_patient` (`patient_id`),
  KEY `orders_accession_number` (`accession_number`),
  KEY `orders_care_setting` (`care_setting`),
  KEY `orders_in_encounter` (`encounter_id`),
  KEY `orders_order_group_id_fk` (`order_group_id`),
  KEY `orders_order_number` (`order_number`),
  KEY `previous_order_id_order_id` (`previous_order_id`),
  KEY `type_of_order` (`order_type_id`),
  KEY `user_who_voided_order` (`voided_by`),
  CONSTRAINT `discontinued_because` FOREIGN KEY (`order_reason`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `fk_orderer_provider` FOREIGN KEY (`orderer`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `order_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_for_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_care_setting` FOREIGN KEY (`care_setting`) REFERENCES `care_setting` (`care_setting_id`),
  CONSTRAINT `orders_in_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `orders_order_group_id_fk` FOREIGN KEY (`order_group_id`) REFERENCES `order_group` (`order_group_id`),
  CONSTRAINT `previous_order_id_order_id` FOREIGN KEY (`previous_order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `type_of_order` FOREIGN KEY (`order_type_id`) REFERENCES `order_type` (`order_type_id`),
  CONSTRAINT `user_who_voided_order` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_attribute`;
CREATE TABLE `order_attribute` (
  `order_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `order_attribute_changed_by_fk` (`changed_by`),
  KEY `order_attribute_creator_fk` (`creator`),
  KEY `order_attribute_order_fk` (`order_id`),
  KEY `order_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `order_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `order_attribute_type` (`order_attribute_type_id`),
  CONSTRAINT `order_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_attribute_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `order_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_attribute_type`;
CREATE TABLE `order_attribute_type` (
  `order_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`order_attribute_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_attribute_type_changed_by_fk` (`changed_by`),
  KEY `order_attribute_type_creator_fk` (`creator`),
  KEY `order_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `order_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_frequency`;
CREATE TABLE `order_frequency` (
  `order_frequency_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) NOT NULL,
  `frequency_per_day` double DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`order_frequency_id`),
  UNIQUE KEY `concept_id` (`concept_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_frequency_changed_by_fk` (`changed_by`),
  KEY `order_frequency_creator_fk` (`creator`),
  KEY `order_frequency_retired_by_fk` (`retired_by`),
  CONSTRAINT `order_frequency_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_frequency_concept_id_fk` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `order_frequency_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_frequency_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_group`;
CREATE TABLE `order_group` (
  `order_group_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_set_id` int(11) DEFAULT NULL,
  `patient_id` int(11) NOT NULL,
  `encounter_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `order_group_reason` int(11) DEFAULT NULL,
  `parent_order_group` int(11) DEFAULT NULL,
  `previous_order_group` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_group_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_group_changed_by_fk` (`changed_by`),
  KEY `order_group_creator_fk` (`creator`),
  KEY `order_group_encounter_id_fk` (`encounter_id`),
  KEY `order_group_order_group_reason_fk` (`order_group_reason`),
  KEY `order_group_parent_order_group_fk` (`parent_order_group`),
  KEY `order_group_patient_id_fk` (`patient_id`),
  KEY `order_group_previous_order_group_fk` (`previous_order_group`),
  KEY `order_group_set_id_fk` (`order_set_id`),
  KEY `order_group_voided_by_fk` (`voided_by`),
  CONSTRAINT `order_group_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_group_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_group_encounter_id_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `order_group_order_group_reason_fk` FOREIGN KEY (`order_group_reason`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `order_group_parent_order_group_fk` FOREIGN KEY (`parent_order_group`) REFERENCES `order_group` (`order_group_id`),
  CONSTRAINT `order_group_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `order_group_previous_order_group_fk` FOREIGN KEY (`previous_order_group`) REFERENCES `order_group` (`order_group_id`),
  CONSTRAINT `order_group_set_id_fk` FOREIGN KEY (`order_set_id`) REFERENCES `order_set` (`order_set_id`),
  CONSTRAINT `order_group_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_group_attribute`;
CREATE TABLE `order_group_attribute` (
  `order_group_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_group_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_group_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_group_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `order_group_attribute_changed_by_fk` (`changed_by`),
  KEY `order_group_attribute_creator_fk` (`creator`),
  KEY `order_group_attribute_order_group_fk` (`order_group_id`),
  KEY `order_group_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `order_group_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `order_group_attribute_type` (`order_group_attribute_type_id`),
  CONSTRAINT `order_group_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_group_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_group_attribute_order_group_fk` FOREIGN KEY (`order_group_id`) REFERENCES `order_group` (`order_group_id`),
  CONSTRAINT `order_group_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_group_attribute_type`;
CREATE TABLE `order_group_attribute_type` (
  `order_group_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`order_group_attribute_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_group_attribute_type_changed_by_fk` (`changed_by`),
  KEY `order_group_attribute_type_creator_fk` (`creator`),
  KEY `order_group_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `order_group_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_group_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_group_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_set`;
CREATE TABLE `order_set` (
  `order_set_id` int(11) NOT NULL AUTO_INCREMENT,
  `operator` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `category` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_set_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `category_order_set_fk` (`category`),
  KEY `order_set_changed_by_fk` (`changed_by`),
  KEY `order_set_creator_fk` (`creator`),
  KEY `order_set_retired_by_fk` (`retired_by`),
  CONSTRAINT `category_order_set_fk` FOREIGN KEY (`category`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `order_set_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_set_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_set_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_set_attribute`;
CREATE TABLE `order_set_attribute` (
  `order_set_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_set_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_set_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_set_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `order_set_attribute_changed_by_fk` (`changed_by`),
  KEY `order_set_attribute_creator_fk` (`creator`),
  KEY `order_set_attribute_order_set_fk` (`order_set_id`),
  KEY `order_set_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `order_set_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `order_set_attribute_type` (`order_set_attribute_type_id`),
  CONSTRAINT `order_set_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_set_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_set_attribute_order_set_fk` FOREIGN KEY (`order_set_id`) REFERENCES `order_set` (`order_set_id`),
  CONSTRAINT `order_set_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_set_attribute_type`;
CREATE TABLE `order_set_attribute_type` (
  `order_set_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`order_set_attribute_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_set_attribute_type_changed_by_fk` (`changed_by`),
  KEY `order_set_attribute_type_creator_fk` (`creator`),
  KEY `order_set_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `order_set_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_set_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_set_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_set_member`;
CREATE TABLE `order_set_member` (
  `order_set_member_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_type` int(11) NOT NULL,
  `order_template` text DEFAULT NULL,
  `order_template_type` varchar(1024) DEFAULT NULL,
  `order_set_id` int(11) NOT NULL,
  `sequence_number` int(11) NOT NULL,
  `concept_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`order_set_member_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_set_member_changed_by_fk` (`changed_by`),
  KEY `order_set_member_concept_id_fk` (`concept_id`),
  KEY `order_set_member_creator_fk` (`creator`),
  KEY `order_set_member_order_set_id_fk` (`order_set_id`),
  KEY `order_set_member_order_type_fk` (`order_type`),
  KEY `order_set_member_retired_by_fk` (`retired_by`),
  CONSTRAINT `order_set_member_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_set_member_concept_id_fk` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `order_set_member_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_set_member_order_set_id_fk` FOREIGN KEY (`order_set_id`) REFERENCES `order_set` (`order_set_id`),
  CONSTRAINT `order_set_member_order_type_fk` FOREIGN KEY (`order_type`) REFERENCES `order_type` (`order_type_id`),
  CONSTRAINT `order_set_member_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_template`;
CREATE TABLE `order_template` (
  `order_template_id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(255) NOT NULL DEFAULT '',
  `concept` int(11) NOT NULL,
  `drug` int(11) DEFAULT NULL,
  `template` text NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_template_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `name` (`name`),
  KEY `order_template_drug_fk` (`drug`),
  KEY `order_template_concept_fk` (`concept`),
  KEY `order_template_creator_fk` (`creator`),
  KEY `order_template_changed_by_fk` (`changed_by`),
  KEY `order_template_retired_by_fk` (`retired_by`),
  CONSTRAINT `order_template_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_template_concept_fk` FOREIGN KEY (`concept`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `order_template_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_template_drug_fk` FOREIGN KEY (`drug`) REFERENCES `drug` (`drug_id`),
  CONSTRAINT `order_template_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_type`;
CREATE TABLE `order_type` (
  `order_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `java_class_name` varchar(255) NOT NULL,
  `parent` int(11) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  PRIMARY KEY (`order_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `order_type_changed_by` (`changed_by`),
  KEY `order_type_parent_order_type` (`parent`),
  KEY `order_type_retired_status` (`retired`),
  KEY `type_created_by` (`creator`),
  KEY `user_who_retired_order_type` (`retired_by`),
  CONSTRAINT `order_type_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_type_parent_order_type` FOREIGN KEY (`parent`) REFERENCES `order_type` (`order_type_id`),
  CONSTRAINT `type_created_by` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_order_type` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_type_class_map`;
CREATE TABLE `order_type_class_map` (
  `order_type_id` int(11) NOT NULL,
  `concept_class_id` int(11) NOT NULL,
  PRIMARY KEY (`order_type_id`,`concept_class_id`),
  UNIQUE KEY `concept_class_id` (`concept_class_id`),
  CONSTRAINT `fk_order_type_class_map_concept_class_concept_class_id` FOREIGN KEY (`concept_class_id`) REFERENCES `concept_class` (`concept_class_id`),
  CONSTRAINT `fk_order_type_order_type_id` FOREIGN KEY (`order_type_id`) REFERENCES `order_type` (`order_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient`;
CREATE TABLE `patient` (
  `patient_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `allergy_status` varchar(50) NOT NULL DEFAULT 'Unknown',
  PRIMARY KEY (`patient_id`),
  KEY `user_who_changed_pat` (`changed_by`),
  KEY `user_who_created_patient` (`creator`),
  KEY `user_who_voided_patient` (`voided_by`),
  CONSTRAINT `person_id_for_patient` FOREIGN KEY (`patient_id`) REFERENCES `person` (`person_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_who_changed_pat` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_created_patient` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_voided_patient` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patientflags_displaypoint`;
CREATE TABLE `patientflags_displaypoint` (
  `displaypoint_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`displaypoint_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patientflags_flag`;
CREATE TABLE `patientflags_flag` (
  `flag_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `criteria` varchar(5000) NOT NULL,
  `message` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `evaluator` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `priority_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`flag_id`),
  UNIQUE KEY `patientflags_flag_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patientflags_flag_tag`;
CREATE TABLE `patientflags_flag_tag` (
  `flag_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  KEY `flag_id` (`flag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `patientflags_flag_tag_ibfk_1` FOREIGN KEY (`flag_id`) REFERENCES `patientflags_flag` (`flag_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `patientflags_flag_tag_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `patientflags_tag` (`tag_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patientflags_patient_flag`;
CREATE TABLE `patientflags_patient_flag` (
  `patient_flag_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `flag_id` int(11) NOT NULL,
  `uuid` char(38) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  PRIMARY KEY (`patient_flag_id`),
  KEY `patientflags_patient_flag_flag_id_fk` (`flag_id`),
  KEY `patientflags_patient_flag_patient_id_fk` (`patient_id`),
  KEY `patientflags_patient_flag_voided_by_fk` (`voided_by`),
  KEY `patientflags_patient_flag_creator_fk` (`creator`),
  KEY `patientflags_patient_flag_changed_by_fk` (`changed_by`),
  CONSTRAINT `patientflags_patient_flag_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patientflags_patient_flag_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patientflags_patient_flag_flag_id_fk` FOREIGN KEY (`flag_id`) REFERENCES `patientflags_flag` (`flag_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `patientflags_patient_flag_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `patientflags_patient_flag_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patientflags_priority`;
CREATE TABLE `patientflags_priority` (
  `priority_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `style` varchar(255) DEFAULT NULL,
  `p_rank` int(11) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`priority_id`),
  UNIQUE KEY `patientflags_priority_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patientflags_tag`;
CREATE TABLE `patientflags_tag` (
  `tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `patientflags_tag_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patientflags_tag_displaypoint`;
CREATE TABLE `patientflags_tag_displaypoint` (
  `tag_id` int(11) NOT NULL,
  `displaypoint_id` int(11) NOT NULL,
  KEY `tag_displaypoint_id` (`tag_id`),
  KEY `patientflags_tag_displaypoint_ibfk_2` (`displaypoint_id`),
  CONSTRAINT `patientflags_tag_displaypoint_ibfk_1` FOREIGN KEY (`tag_id`) REFERENCES `patientflags_tag` (`tag_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `patientflags_tag_displaypoint_ibfk_2` FOREIGN KEY (`displaypoint_id`) REFERENCES `patientflags_displaypoint` (`displaypoint_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patientflags_tag_role`;
CREATE TABLE `patientflags_tag_role` (
  `tag_id` int(11) NOT NULL,
  `role` varchar(50) NOT NULL,
  KEY `patientflags_role` (`role`),
  KEY `tag_role_id` (`tag_id`),
  CONSTRAINT `patientflags_tag_role_ibfk_1` FOREIGN KEY (`tag_id`) REFERENCES `patientflags_tag` (`tag_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `patientflags_tag_role_ibfk_2` FOREIGN KEY (`role`) REFERENCES `role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_appointment`;
CREATE TABLE `patient_appointment` (
  `patient_appointment_id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) DEFAULT NULL,
  `appointment_number` varchar(50) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `start_date_time` datetime DEFAULT NULL,
  `end_date_time` datetime DEFAULT NULL,
  `appointment_service_id` int(11) DEFAULT NULL,
  `appointment_service_type_id` int(11) DEFAULT NULL,
  `status` varchar(45) NOT NULL COMMENT 'scheduled, checked in, started, completed, cancelled, missed',
  `location_id` int(11) DEFAULT NULL,
  `appointment_kind` varchar(45) NOT NULL COMMENT 'scheduled, walk in',
  `comments` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `related_appointment_id` int(11) DEFAULT NULL,
  `tele_health_video_link` varchar(255) DEFAULT NULL,
  `priority` varchar(45) DEFAULT NULL,
  `date_appointment_scheduled` datetime DEFAULT NULL,
  PRIMARY KEY (`patient_appointment_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_patient_appointment_patient` (`patient_id`),
  KEY `fk_patient_appointment_location` (`location_id`),
  KEY `fk_patient_appointment_provider` (`provider_id`),
  KEY `fk_patient_appointment_appointment_service` (`appointment_service_id`),
  KEY `fk_patient_appointment_appointment_service_type` (`appointment_service_type_id`),
  KEY `patient_appointment_id_fk` (`related_appointment_id`),
  KEY `patient_appointment_appointment_number_idx` (`appointment_number`),
  CONSTRAINT `fk_patient_appointment_appointment_service` FOREIGN KEY (`appointment_service_id`) REFERENCES `appointment_service` (`appointment_service_id`),
  CONSTRAINT `fk_patient_appointment_appointment_service_type` FOREIGN KEY (`appointment_service_type_id`) REFERENCES `appointment_service_type` (`appointment_service_type_id`),
  CONSTRAINT `fk_patient_appointment_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `fk_patient_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `fk_patient_appointment_provider` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `patient_appointment_id_fk` FOREIGN KEY (`related_appointment_id`) REFERENCES `patient_appointment` (`patient_appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_appointment_audit`;
CREATE TABLE `patient_appointment_audit` (
  `patient_appointment_audit_id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_id` int(11) NOT NULL,
  `uuid` varchar(38) NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `status` varchar(45) NOT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`patient_appointment_audit_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_patient_appointment_audit_patient_appointment_idx` (`appointment_id`),
  CONSTRAINT `fk_patient_appointment_audit_patient_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `patient_appointment` (`patient_appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_appointment_fulfilling_encounter_map`;
CREATE TABLE `patient_appointment_fulfilling_encounter_map` (
  `patient_appointment_id` int(11) NOT NULL,
  `fulfilling_encounter_id` int(11) NOT NULL,
  PRIMARY KEY (`patient_appointment_id`,`fulfilling_encounter_id`),
  KEY `patient_appointment_fulfilling_encounter_map_encounter` (`fulfilling_encounter_id`),
  CONSTRAINT `patient_appointment_fulfilling_encounter_map_encounter` FOREIGN KEY (`fulfilling_encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `patient_appointment_fulfilling_encounter_map_patient_appointment` FOREIGN KEY (`patient_appointment_id`) REFERENCES `patient_appointment` (`patient_appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_appointment_occurrence`;
CREATE TABLE `patient_appointment_occurrence` (
  `patient_appointment_timings_id` int(11) DEFAULT NULL,
  `patient_appointment_id` int(11) DEFAULT NULL,
  KEY `patient_appointment_timings_id` (`patient_appointment_timings_id`),
  KEY `patient_appointment_id` (`patient_appointment_id`),
  CONSTRAINT `patient_appointment_occurrence_ibfk_1` FOREIGN KEY (`patient_appointment_timings_id`) REFERENCES `patient_appointment_recurring_time` (`patient_appointment_timings_id`),
  CONSTRAINT `patient_appointment_occurrence_ibfk_2` FOREIGN KEY (`patient_appointment_id`) REFERENCES `patient_appointment` (`patient_appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_appointment_provider`;
CREATE TABLE `patient_appointment_provider` (
  `patient_appointment_provider_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_appointment_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `response` varchar(32) DEFAULT NULL,
  `comments` varchar(1000) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  PRIMARY KEY (`patient_appointment_provider_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_patient_appointment_provider_patient_appointment` (`patient_appointment_id`),
  KEY `fk_patient_appointment_provider_provider` (`provider_id`),
  CONSTRAINT `fk_patient_appointment_provider_patient_appointment` FOREIGN KEY (`patient_appointment_id`) REFERENCES `patient_appointment` (`patient_appointment_id`),
  CONSTRAINT `fk_patient_appointment_provider_provider` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_appointment_reason`;
CREATE TABLE `patient_appointment_reason` (
  `patient_appointment_reason_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_appointment_id` int(11) NOT NULL,
  `reason_code` int(11) NOT NULL,
  `uuid` varchar(38) NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`patient_appointment_reason_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_patient_appointment_reason_appointment` (`patient_appointment_id`),
  KEY `fk_patient_appointment_reason_concept` (`reason_code`),
  KEY `fk_patient_appointment_reason_creator` (`creator`),
  KEY `fk_patient_appointment_reason_changed_by` (`changed_by`),
  KEY `fk_patient_appointment_reason_voided_by` (`voided_by`),
  CONSTRAINT `fk_patient_appointment_reason_appointment` FOREIGN KEY (`patient_appointment_id`) REFERENCES `patient_appointment` (`patient_appointment_id`),
  CONSTRAINT `fk_patient_appointment_reason_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_patient_appointment_reason_concept` FOREIGN KEY (`reason_code`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `fk_patient_appointment_reason_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_patient_appointment_reason_voided_by` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_appointment_recurring_time`;
CREATE TABLE `patient_appointment_recurring_time` (
  `patient_appointment_timings_id` int(11) NOT NULL AUTO_INCREMENT,
  `recurrence_type` varchar(20) NOT NULL,
  `period` int(11) NOT NULL,
  `frequency` int(11) DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `days_of_week` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`patient_appointment_timings_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_identifier`;
CREATE TABLE `patient_identifier` (
  `patient_identifier_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL DEFAULT 0,
  `identifier` varchar(50) NOT NULL DEFAULT '',
  `identifier_type` int(11) NOT NULL DEFAULT 0,
  `preferred` tinyint(1) NOT NULL DEFAULT 0,
  `location_id` int(11) DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `patient_program_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`patient_identifier_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `defines_identifier_type` (`identifier_type`),
  KEY `identifier_creator` (`creator`),
  KEY `identifier_name` (`identifier`),
  KEY `identifier_voider` (`voided_by`),
  KEY `idx_patient_identifier_patient` (`patient_id`),
  KEY `patient_identifier_changed_by` (`changed_by`),
  KEY `patient_identifier_ibfk_2` (`location_id`),
  KEY `patient_identifier_program_id_fk` (`patient_program_id`),
  CONSTRAINT `defines_identifier_type` FOREIGN KEY (`identifier_type`) REFERENCES `patient_identifier_type` (`patient_identifier_type_id`),
  CONSTRAINT `fk_patient_id_patient_identifier` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `identifier_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `identifier_voider` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patient_identifier_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patient_identifier_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `patient_identifier_program_id_fk` FOREIGN KEY (`patient_program_id`) REFERENCES `patient_program` (`patient_program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_identifier_type`;
CREATE TABLE `patient_identifier_type` (
  `patient_identifier_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `format` varchar(255) DEFAULT NULL,
  `check_digit` tinyint(1) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `format_description` varchar(255) DEFAULT NULL,
  `validator` varchar(200) DEFAULT NULL,
  `location_behavior` varchar(50) DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `uniqueness_behavior` varchar(50) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`patient_identifier_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `patient_identifier_type_changed_by` (`changed_by`),
  KEY `patient_identifier_type_retired_status` (`retired`),
  KEY `type_creator` (`creator`),
  KEY `user_who_retired_patient_identifier_type` (`retired_by`),
  CONSTRAINT `patient_identifier_type_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `type_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_patient_identifier_type` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_program`;
CREATE TABLE `patient_program` (
  `patient_program_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL DEFAULT 0,
  `program_id` int(11) NOT NULL DEFAULT 0,
  `date_enrolled` datetime DEFAULT NULL,
  `date_completed` datetime DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `outcome_concept_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`patient_program_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `patient_in_program` (`patient_id`),
  KEY `patient_program_creator` (`creator`),
  KEY `patient_program_location_id` (`location_id`),
  KEY `patient_program_outcome_concept_id_fk` (`outcome_concept_id`),
  KEY `program_for_patient` (`program_id`),
  KEY `user_who_changed` (`changed_by`),
  KEY `user_who_voided_patient_program` (`voided_by`),
  CONSTRAINT `patient_in_program` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `patient_program_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patient_program_location_id` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `patient_program_outcome_concept_id_fk` FOREIGN KEY (`outcome_concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `program_for_patient` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`),
  CONSTRAINT `user_who_changed` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_voided_patient_program` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_program_attribute`;
CREATE TABLE `patient_program_attribute` (
  `patient_program_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_program_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`patient_program_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `patient_program_attribute_attributetype_fk` (`attribute_type_id`),
  KEY `patient_program_attribute_changed_by_fk` (`changed_by`),
  KEY `patient_program_attribute_creator_fk` (`creator`),
  KEY `patient_program_attribute_programid_fk` (`patient_program_id`),
  KEY `patient_program_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `patient_program_attribute_attributetype_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `program_attribute_type` (`program_attribute_type_id`),
  CONSTRAINT `patient_program_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patient_program_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patient_program_attribute_programid_fk` FOREIGN KEY (`patient_program_id`) REFERENCES `patient_program` (`patient_program_id`),
  CONSTRAINT `patient_program_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `patient_state`;
CREATE TABLE `patient_state` (
  `patient_state_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_program_id` int(11) NOT NULL DEFAULT 0,
  `state` int(11) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `form_namespace_and_path` varchar(255) DEFAULT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`patient_state_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `patient_program_for_state` (`patient_program_id`),
  KEY `patient_state_changer` (`changed_by`),
  KEY `patient_state_creator` (`creator`),
  KEY `patient_state_encounter_id_fk` (`encounter_id`),
  KEY `patient_state_voider` (`voided_by`),
  KEY `state_for_patient` (`state`),
  CONSTRAINT `patient_program_for_state` FOREIGN KEY (`patient_program_id`) REFERENCES `patient_program` (`patient_program_id`),
  CONSTRAINT `patient_state_changer` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patient_state_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patient_state_encounter_id_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`),
  CONSTRAINT `patient_state_voider` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `state_for_patient` FOREIGN KEY (`state`) REFERENCES `program_workflow_state` (`program_workflow_state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `person`;
CREATE TABLE `person` (
  `person_id` int(11) NOT NULL AUTO_INCREMENT,
  `gender` varchar(50) DEFAULT '',
  `birthdate` date DEFAULT NULL,
  `birthdate_estimated` tinyint(1) NOT NULL DEFAULT 0,
  `dead` tinyint(1) NOT NULL DEFAULT 0,
  `death_date` datetime DEFAULT NULL,
  `cause_of_death` int(11) DEFAULT NULL,
  `creator` int(11) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `deathdate_estimated` tinyint(1) NOT NULL DEFAULT 0,
  `birthtime` time DEFAULT NULL,
  `cause_of_death_non_coded` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`person_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `person_birthdate` (`birthdate`),
  KEY `person_death_date` (`death_date`),
  KEY `person_died_because` (`cause_of_death`),
  KEY `user_who_changed_person` (`changed_by`),
  KEY `user_who_created_person` (`creator`),
  KEY `user_who_voided_person` (`voided_by`),
  CONSTRAINT `person_died_because` FOREIGN KEY (`cause_of_death`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `user_who_changed_person` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_created_person` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_voided_person` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `person_address`;
CREATE TABLE `person_address` (
  `person_address_id` int(11) NOT NULL AUTO_INCREMENT,
  `person_id` int(11) DEFAULT NULL,
  `preferred` tinyint(1) NOT NULL DEFAULT 0,
  `address1` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `city_village` varchar(255) DEFAULT NULL,
  `state_province` varchar(255) DEFAULT NULL,
  `postal_code` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `county_district` varchar(255) DEFAULT NULL,
  `address3` varchar(255) DEFAULT NULL,
  `address4` varchar(255) DEFAULT NULL,
  `address5` varchar(255) DEFAULT NULL,
  `address6` varchar(255) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `address7` varchar(255) DEFAULT NULL,
  `address8` varchar(255) DEFAULT NULL,
  `address9` varchar(255) DEFAULT NULL,
  `address10` varchar(255) DEFAULT NULL,
  `address11` varchar(255) DEFAULT NULL,
  `address12` varchar(255) DEFAULT NULL,
  `address13` varchar(255) DEFAULT NULL,
  `address14` varchar(255) DEFAULT NULL,
  `address15` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`person_address_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `address_for_person` (`person_id`),
  KEY `patient_address_creator` (`creator`),
  KEY `patient_address_void` (`voided_by`),
  KEY `person_address_changed_by` (`changed_by`),
  CONSTRAINT `address_for_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`) ON UPDATE CASCADE,
  CONSTRAINT `patient_address_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `patient_address_void` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `person_address_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `person_attribute`;
CREATE TABLE `person_attribute` (
  `person_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `person_id` int(11) NOT NULL DEFAULT 0,
  `value` varchar(50) NOT NULL DEFAULT '',
  `person_attribute_type_id` int(11) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`person_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `attribute_changer` (`changed_by`),
  KEY `attribute_creator` (`creator`),
  KEY `attribute_voider` (`voided_by`),
  KEY `defines_attribute_type` (`person_attribute_type_id`),
  KEY `identifies_person` (`person_id`),
  CONSTRAINT `attribute_changer` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `attribute_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `attribute_voider` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `defines_attribute_type` FOREIGN KEY (`person_attribute_type_id`) REFERENCES `person_attribute_type` (`person_attribute_type_id`),
  CONSTRAINT `identifies_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `person_attribute_type`;
CREATE TABLE `person_attribute_type` (
  `person_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `format` varchar(50) DEFAULT NULL,
  `foreign_key` int(11) DEFAULT NULL,
  `searchable` tinyint(1) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `edit_privilege` varchar(255) DEFAULT NULL,
  `sort_weight` double DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`person_attribute_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `attribute_is_searchable` (`searchable`),
  KEY `attribute_type_changer` (`changed_by`),
  KEY `attribute_type_creator` (`creator`),
  KEY `name_of_attribute` (`name`),
  KEY `person_attribute_type_retired_status` (`retired`),
  KEY `privilege_which_can_edit` (`edit_privilege`),
  KEY `user_who_retired_person_attribute_type` (`retired_by`),
  CONSTRAINT `attribute_type_changer` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `attribute_type_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `privilege_which_can_edit` FOREIGN KEY (`edit_privilege`) REFERENCES `privilege` (`privilege`),
  CONSTRAINT `user_who_retired_person_attribute_type` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `person_merge_log`;
CREATE TABLE `person_merge_log` (
  `person_merge_log_id` int(11) NOT NULL AUTO_INCREMENT,
  `winner_person_id` int(11) NOT NULL,
  `loser_person_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `merged_data` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`person_merge_log_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `person_merge_log_changed_by_fk` (`changed_by`),
  KEY `person_merge_log_creator` (`creator`),
  KEY `person_merge_log_loser` (`loser_person_id`),
  KEY `person_merge_log_voided_by_fk` (`voided_by`),
  KEY `person_merge_log_winner` (`winner_person_id`),
  CONSTRAINT `person_merge_log_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `person_merge_log_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `person_merge_log_loser` FOREIGN KEY (`loser_person_id`) REFERENCES `person` (`person_id`),
  CONSTRAINT `person_merge_log_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `person_merge_log_winner` FOREIGN KEY (`winner_person_id`) REFERENCES `person` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `person_name`;
CREATE TABLE `person_name` (
  `person_name_id` int(11) NOT NULL AUTO_INCREMENT,
  `preferred` tinyint(1) NOT NULL DEFAULT 0,
  `person_id` int(11) NOT NULL,
  `prefix` varchar(50) DEFAULT NULL,
  `given_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `family_name_prefix` varchar(50) DEFAULT NULL,
  `family_name` varchar(50) DEFAULT NULL,
  `family_name2` varchar(50) DEFAULT NULL,
  `family_name_suffix` varchar(50) DEFAULT NULL,
  `degree` varchar(50) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`person_name_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `family_name2` (`family_name2`),
  KEY `first_name` (`given_name`),
  KEY `last_name` (`family_name`),
  KEY `middle_name` (`middle_name`),
  KEY `name_for_person` (`person_id`),
  KEY `user_who_made_name` (`creator`),
  KEY `user_who_voided_name` (`voided_by`),
  CONSTRAINT `name_for_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_who_made_name` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_voided_name` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `privilege`;
CREATE TABLE `privilege` (
  `privilege` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`privilege`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `program`;
CREATE TABLE `program` (
  `program_id` int(11) NOT NULL AUTO_INCREMENT,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `outcomes_concept_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`program_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `program_concept` (`concept_id`),
  KEY `program_creator` (`creator`),
  KEY `program_outcomes_concept_id_fk` (`outcomes_concept_id`),
  KEY `user_who_changed_program` (`changed_by`),
  CONSTRAINT `program_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `program_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `program_outcomes_concept_id_fk` FOREIGN KEY (`outcomes_concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `user_who_changed_program` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `program_attribute_type`;
CREATE TABLE `program_attribute_type` (
  `program_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`program_attribute_type_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `program_attribute_type_changed_by_fk` (`changed_by`),
  KEY `program_attribute_type_creator_fk` (`creator`),
  KEY `program_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `program_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `program_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `program_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `program_workflow`;
CREATE TABLE `program_workflow` (
  `program_workflow_id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL DEFAULT 0,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`program_workflow_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `program_for_workflow` (`program_id`),
  KEY `workflow_changed_by` (`changed_by`),
  KEY `workflow_concept` (`concept_id`),
  KEY `workflow_creator` (`creator`),
  CONSTRAINT `program_for_workflow` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`),
  CONSTRAINT `workflow_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `workflow_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `workflow_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `program_workflow_state`;
CREATE TABLE `program_workflow_state` (
  `program_workflow_state_id` int(11) NOT NULL AUTO_INCREMENT,
  `program_workflow_id` int(11) NOT NULL DEFAULT 0,
  `concept_id` int(11) NOT NULL DEFAULT 0,
  `initial` tinyint(1) NOT NULL DEFAULT 0,
  `terminal` tinyint(1) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`program_workflow_state_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `state_changed_by` (`changed_by`),
  KEY `state_concept` (`concept_id`),
  KEY `state_creator` (`creator`),
  KEY `workflow_for_state` (`program_workflow_id`),
  CONSTRAINT `state_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `state_concept` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `state_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `workflow_for_state` FOREIGN KEY (`program_workflow_id`) REFERENCES `program_workflow` (`program_workflow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `provider`;
CREATE TABLE `provider` (
  `provider_id` int(11) NOT NULL AUTO_INCREMENT,
  `person_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `identifier` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `speciality_id` int(11) DEFAULT NULL,
  `provider_role_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`provider_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_provider_provider_role_id` (`provider_role_id`),
  KEY `provider_changed_by_fk` (`changed_by`),
  KEY `provider_creator_fk` (`creator`),
  KEY `provider_person_id_fk` (`person_id`),
  KEY `provider_retired_by_fk` (`retired_by`),
  KEY `provider_role_id_fk` (`role_id`),
  KEY `provider_speciality_id_fk` (`speciality_id`),
  CONSTRAINT `fk_provider_provider_role_id` FOREIGN KEY (`provider_role_id`) REFERENCES `provider_role` (`provider_role_id`),
  CONSTRAINT `provider_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `provider_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `provider_person_id_fk` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`),
  CONSTRAINT `provider_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `provider_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `provider_speciality_id_fk` FOREIGN KEY (`speciality_id`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `provider_attribute`;
CREATE TABLE `provider_attribute` (
  `provider_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`provider_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `provider_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `provider_attribute_changed_by_fk` (`changed_by`),
  KEY `provider_attribute_creator_fk` (`creator`),
  KEY `provider_attribute_provider_fk` (`provider_id`),
  KEY `provider_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `provider_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `provider_attribute_type` (`provider_attribute_type_id`),
  CONSTRAINT `provider_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `provider_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `provider_attribute_provider_fk` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `provider_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `provider_attribute_type`;
CREATE TABLE `provider_attribute_type` (
  `provider_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`provider_attribute_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `provider_attribute_type_changed_by_fk` (`changed_by`),
  KEY `provider_attribute_type_creator_fk` (`creator`),
  KEY `provider_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `provider_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `provider_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `provider_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `provider_role`;
CREATE TABLE `provider_role` (
  `provider_role_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`provider_role_id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `queue`;
CREATE TABLE `queue` (
  `queue_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `location_id` int(11) NOT NULL,
  `service` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL,
  `priority_concept_set` int(11) DEFAULT NULL,
  `status_concept_set` int(11) DEFAULT NULL,
  PRIMARY KEY (`queue_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `queue_creator_fk` (`creator`),
  KEY `queue_changed_by_fk` (`changed_by`),
  KEY `queue_retired_by_fk` (`retired_by`),
  KEY `queue_location_id_fk` (`location_id`),
  KEY `queue_service_fk` (`service`),
  KEY `queue_priority_concept_set_fk` (`priority_concept_set`),
  KEY `queue_status_concept_set_fk` (`status_concept_set`),
  CONSTRAINT `queue_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `queue_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `queue_location_id_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `queue_priority_concept_set_fk` FOREIGN KEY (`priority_concept_set`) REFERENCES `concept` (`concept_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `queue_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `queue_service_fk` FOREIGN KEY (`service`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `queue_status_concept_set_fk` FOREIGN KEY (`status_concept_set`) REFERENCES `concept` (`concept_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `queue_entry`;
CREATE TABLE `queue_entry` (
  `queue_entry_id` int(11) NOT NULL AUTO_INCREMENT,
  `queue_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `priority` int(11) NOT NULL,
  `priority_comment` varchar(255) DEFAULT NULL,
  `status` int(11) NOT NULL,
  `sort_weight` double DEFAULT NULL,
  `location_waiting_for` int(11) DEFAULT NULL,
  `provider_waiting_for` int(11) DEFAULT NULL,
  `started_at` datetime NOT NULL,
  `ended_at` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `queue_coming_from` int(11) DEFAULT NULL,
  `visit_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`queue_entry_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `queue_entry_creator_fk` (`creator`),
  KEY `queue_entry_changed_by_fk` (`changed_by`),
  KEY `queue_entry_voided_by_fk` (`voided_by`),
  KEY `queue_entry_queue_id_fk` (`queue_id`),
  KEY `queue_entry_patient_id_fk` (`patient_id`),
  KEY `queue_entry_priority_fk` (`priority`),
  KEY `queue_entry_status_fk` (`status`),
  KEY `queue_entry_location_waiting_for_fk` (`location_waiting_for`),
  KEY `queue_entry_provider_waiting_for_fk` (`provider_waiting_for`),
  KEY `queue_entry_queue_coming_from_id_fk` (`queue_coming_from`),
  KEY `queue_entry_visit_id_fk` (`visit_id`),
  CONSTRAINT `queue_entry_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `queue_entry_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `queue_entry_location_waiting_for_fk` FOREIGN KEY (`location_waiting_for`) REFERENCES `location` (`location_id`),
  CONSTRAINT `queue_entry_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `queue_entry_priority_fk` FOREIGN KEY (`priority`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `queue_entry_provider_waiting_for_fk` FOREIGN KEY (`provider_waiting_for`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `queue_entry_queue_coming_from_id_fk` FOREIGN KEY (`queue_coming_from`) REFERENCES `queue` (`queue_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `queue_entry_queue_id_fk` FOREIGN KEY (`queue_id`) REFERENCES `queue` (`queue_id`),
  CONSTRAINT `queue_entry_status_fk` FOREIGN KEY (`status`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `queue_entry_visit_id_fk` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `queue_entry_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `queue_room`;
CREATE TABLE `queue_room` (
  `queue_room_id` int(11) NOT NULL AUTO_INCREMENT,
  `queue_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`queue_room_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `queue_room_creator_fk` (`creator`),
  KEY `queue_room_changed_by_fk` (`changed_by`),
  KEY `queue_room_voided_by_fk` (`retired_by`),
  KEY `queue_room_queue_id_fk` (`queue_id`),
  CONSTRAINT `queue_room_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `queue_room_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `queue_room_queue_id_fk` FOREIGN KEY (`queue_id`) REFERENCES `queue` (`queue_id`),
  CONSTRAINT `queue_room_voided_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `referral_order`;
CREATE TABLE `referral_order` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `specimen_source` int(11) DEFAULT NULL,
  `laterality` varchar(20) DEFAULT NULL,
  `clinical_history` text DEFAULT NULL,
  `frequency` int(11) DEFAULT NULL,
  `number_of_repeats` int(11) DEFAULT NULL,
  `location` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `referral_order_frequency_index` (`frequency`),
  KEY `referral_order_location_fk` (`location`),
  KEY `referral_order_specimen_source_index` (`specimen_source`),
  CONSTRAINT `referral_order_frequency_fk` FOREIGN KEY (`frequency`) REFERENCES `order_frequency` (`order_frequency_id`),
  CONSTRAINT `referral_order_location_fk` FOREIGN KEY (`location`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `referral_order_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `referral_order_specimen_source_fk` FOREIGN KEY (`specimen_source`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `relationship`;
CREATE TABLE `relationship` (
  `relationship_id` int(11) NOT NULL AUTO_INCREMENT,
  `person_a` int(11) NOT NULL,
  `relationship` int(11) NOT NULL DEFAULT 0,
  `person_b` int(11) NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`relationship_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `person_a_is_person` (`person_a`),
  KEY `person_b_is_person` (`person_b`),
  KEY `relation_creator` (`creator`),
  KEY `relation_voider` (`voided_by`),
  KEY `relationship_changed_by` (`changed_by`),
  KEY `relationship_type_id` (`relationship`),
  CONSTRAINT `person_a_is_person` FOREIGN KEY (`person_a`) REFERENCES `person` (`person_id`),
  CONSTRAINT `person_b_is_person` FOREIGN KEY (`person_b`) REFERENCES `person` (`person_id`),
  CONSTRAINT `relation_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `relation_voider` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `relationship_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `relationship_type_id` FOREIGN KEY (`relationship`) REFERENCES `relationship_type` (`relationship_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `relationship_type`;
CREATE TABLE `relationship_type` (
  `relationship_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `a_is_to_b` varchar(50) NOT NULL,
  `b_is_to_a` varchar(50) NOT NULL,
  `preferred` tinyint(1) NOT NULL DEFAULT 0,
  `weight` int(11) NOT NULL DEFAULT 0,
  `description` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`relationship_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `relationship_type_changed_by` (`changed_by`),
  KEY `user_who_created_rel` (`creator`),
  KEY `user_who_retired_relationship_type` (`retired_by`),
  CONSTRAINT `relationship_type_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_created_rel` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_retired_relationship_type` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `reporting_report_design`;
CREATE TABLE `reporting_report_design` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `renderer_type` varchar(255) NOT NULL,
  `properties` text DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `report_definition_uuid` char(38) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `creator_for_reporting_report_design` (`creator`),
  KEY `changed_by_for_reporting_report_design` (`changed_by`),
  KEY `retired_by_for_reporting_report_design` (`retired_by`),
  KEY `report_definition_uuid_for_reporting_report_design` (`report_definition_uuid`),
  CONSTRAINT `changed_by_for_reporting_report_design` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `creator_for_reporting_report_design` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `retired_by_for_reporting_report_design` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `reporting_report_design_resource`;
CREATE TABLE `reporting_report_design_resource` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `report_design_id` int(11) NOT NULL DEFAULT 0,
  `content_type` varchar(100) DEFAULT NULL,
  `extension` varchar(20) DEFAULT NULL,
  `contents` longblob DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `report_design_id_for_reporting_report_design_resource` (`report_design_id`),
  KEY `creator_for_reporting_report_design_resource` (`creator`),
  KEY `changed_by_for_reporting_report_design_resource` (`changed_by`),
  KEY `retired_by_for_reporting_report_design_resource` (`retired_by`),
  CONSTRAINT `changed_by_for_reporting_report_design_resource` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `creator_for_reporting_report_design_resource` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `report_design_id_for_reporting_report_design_resource` FOREIGN KEY (`report_design_id`) REFERENCES `reporting_report_design` (`id`),
  CONSTRAINT `retired_by_for_reporting_report_design_resource` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `reporting_report_processor`;
CREATE TABLE `reporting_report_processor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `processor_type` varchar(255) NOT NULL,
  `configuration` mediumtext DEFAULT NULL,
  `run_on_success` tinyint(1) NOT NULL DEFAULT 1,
  `run_on_error` tinyint(1) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `report_design_id` int(11) DEFAULT NULL,
  `processor_mode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `creator_for_reporting_report_processor` (`creator`),
  KEY `changed_by_for_reporting_report_processor` (`changed_by`),
  KEY `retired_by_for_reporting_report_processor` (`retired_by`),
  KEY `reporting_report_processor_report_design` (`report_design_id`),
  CONSTRAINT `changed_by_for_reporting_report_processor` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `creator_for_reporting_report_processor` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `reporting_report_processor_report_design` FOREIGN KEY (`report_design_id`) REFERENCES `reporting_report_design` (`id`),
  CONSTRAINT `retired_by_for_reporting_report_processor` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `reporting_report_request`;
CREATE TABLE `reporting_report_request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `base_cohort_uuid` char(38) DEFAULT NULL,
  `base_cohort_parameters` text DEFAULT NULL,
  `report_definition_uuid` char(38) NOT NULL,
  `report_definition_parameters` text DEFAULT NULL,
  `renderer_type` varchar(255) NOT NULL,
  `renderer_argument` varchar(255) DEFAULT NULL,
  `requested_by` int(11) NOT NULL DEFAULT 0,
  `request_datetime` datetime NOT NULL,
  `priority` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `evaluation_start_datetime` datetime DEFAULT NULL,
  `evaluation_complete_datetime` datetime DEFAULT NULL,
  `render_complete_datetime` datetime DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `schedule` varchar(100) DEFAULT NULL,
  `process_automatically` tinyint(1) NOT NULL DEFAULT 0,
  `minimum_days_to_preserve` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `requested_by_for_reporting_report_request` (`requested_by`),
  CONSTRAINT `requested_by_for_reporting_report_request` FOREIGN KEY (`requested_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `report_object`;
CREATE TABLE `report_object` (
  `report_object_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `report_object_type` varchar(255) NOT NULL,
  `report_object_sub_type` varchar(255) NOT NULL,
  `xml_data` text DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`report_object_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `report_object_creator` (`creator`),
  KEY `user_who_changed_report_object` (`changed_by`),
  KEY `user_who_voided_report_object` (`voided_by`),
  CONSTRAINT `report_object_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_changed_report_object` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_voided_report_object` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `report_schema_xml`;
CREATE TABLE `report_schema_xml` (
  `report_schema_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `xml_data` text NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`report_schema_id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `role` varchar(50) NOT NULL DEFAULT '',
  `description` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`role`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `role_privilege`;
CREATE TABLE `role_privilege` (
  `role` varchar(50) NOT NULL DEFAULT '',
  `privilege` varchar(255) NOT NULL,
  PRIMARY KEY (`role`,`privilege`),
  KEY `privilege_definitions` (`privilege`),
  KEY `role_privilege_to_role` (`role`),
  CONSTRAINT `privilege_definitions` FOREIGN KEY (`privilege`) REFERENCES `privilege` (`privilege`),
  CONSTRAINT `role_privilege_to_role` FOREIGN KEY (`role`) REFERENCES `role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `role_role`;
CREATE TABLE `role_role` (
  `parent_role` varchar(50) NOT NULL DEFAULT '',
  `child_role` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`parent_role`,`child_role`),
  KEY `inherited_role` (`child_role`),
  CONSTRAINT `inherited_role` FOREIGN KEY (`child_role`) REFERENCES `role` (`role`),
  CONSTRAINT `parent_role` FOREIGN KEY (`parent_role`) REFERENCES `role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `room_provider_map`;
CREATE TABLE `room_provider_map` (
  `room_provider_map_id` int(11) NOT NULL AUTO_INCREMENT,
  `queue_room_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`room_provider_map_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `room_provider_map_creator_fk` (`creator`),
  KEY `room_provider_map_changed_by_fk` (`changed_by`),
  KEY `room_provider_map_voided_by_fk` (`voided_by`),
  KEY `room_provider_map_queue_room_fk` (`queue_room_id`),
  KEY `room_provider_map_provider_id_fk` (`provider_id`),
  CONSTRAINT `room_provider_map_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `room_provider_map_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `room_provider_map_provider_id_fk` FOREIGN KEY (`provider_id`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `room_provider_map_queue_room_fk` FOREIGN KEY (`queue_room_id`) REFERENCES `queue_room` (`queue_room_id`),
  CONSTRAINT `room_provider_map_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `scheduler_task_config`;
CREATE TABLE `scheduler_task_config` (
  `task_config_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `schedulable_class` text DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `start_time_pattern` varchar(50) DEFAULT NULL,
  `repeat_interval` int(11) NOT NULL DEFAULT 0,
  `start_on_startup` tinyint(1) NOT NULL DEFAULT 0,
  `started` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT 0,
  `date_created` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `last_execution_time` datetime DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`task_config_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `scheduler_changer` (`changed_by`),
  KEY `scheduler_creator` (`created_by`),
  CONSTRAINT `scheduler_changer` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `scheduler_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `scheduler_task_config_property`;
CREATE TABLE `scheduler_task_config_property` (
  `task_config_property_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `task_config_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`task_config_property_id`),
  KEY `task_config_for_property` (`task_config_id`),
  CONSTRAINT `task_config_for_property` FOREIGN KEY (`task_config_id`) REFERENCES `scheduler_task_config` (`task_config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `serialized_object`;
CREATE TABLE `serialized_object` (
  `serialized_object_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(5000) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `subtype` varchar(255) NOT NULL,
  `serialization_class` varchar(255) NOT NULL,
  `serialized_data` mediumtext NOT NULL,
  `date_created` datetime NOT NULL,
  `creator` int(11) NOT NULL,
  `date_changed` datetime DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `date_retired` datetime DEFAULT NULL,
  `retired_by` int(11) DEFAULT NULL,
  `retire_reason` varchar(1000) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`serialized_object_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `serialized_object_changed_by` (`changed_by`),
  KEY `serialized_object_creator` (`creator`),
  KEY `serialized_object_retired_by` (`retired_by`),
  CONSTRAINT `serialized_object_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `serialized_object_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `serialized_object_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_batch_job`;
CREATE TABLE `stockmgmt_batch_job` (
  `batch_job_id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_job_type` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `expiration` datetime DEFAULT NULL,
  `parameters` varchar(5000) NOT NULL,
  `privilege_scope` varchar(255) DEFAULT NULL,
  `location_scope` int(11) DEFAULT NULL,
  `execution_state` varchar(5000) DEFAULT NULL,
  `cancelled_by` int(11) DEFAULT NULL,
  `cancelled_date` datetime DEFAULT NULL,
  `cancel_reason` varchar(500) DEFAULT NULL,
  `exit_message` varchar(2500) DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  `output_artifact_size` bigint(20) DEFAULT NULL,
  `output_artifact_file_ext` varchar(10) DEFAULT NULL,
  `output_artifact_viewable` tinyint(1) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`batch_job_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_batch_job_cancelled_by_fk` (`cancelled_by`),
  KEY `stockmgmt_batch_job_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_batch_job_creator_fk` (`creator`),
  KEY `stockmgmt_batch_job_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_batch_job_location_fk` (`location_scope`),
  CONSTRAINT `stockmgmt_batch_job_cancelled_by_fk` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_batch_job_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_batch_job_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_batch_job_location_fk` FOREIGN KEY (`location_scope`) REFERENCES `location` (`location_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_batch_job_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_batch_job_owner`;
CREATE TABLE `stockmgmt_batch_job_owner` (
  `batch_job_owner_id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_job_id` int(11) NOT NULL,
  `owner` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`batch_job_owner_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_batch_job_owner_batch_job_fk` (`batch_job_id`),
  KEY `stockmgmt_batch_job_owner_owner_fk` (`owner`),
  CONSTRAINT `stockmgmt_batch_job_owner_batch_job_fk` FOREIGN KEY (`batch_job_id`) REFERENCES `stockmgmt_batch_job` (`batch_job_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_batch_job_owner_owner_fk` FOREIGN KEY (`owner`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_location_tree`;
CREATE TABLE `stockmgmt_location_tree` (
  `stockmgmt_location_tree_id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_location_id` int(11) NOT NULL,
  `child_location_id` int(11) NOT NULL,
  `depth` int(11) NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`stockmgmt_location_tree_id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_operation_type_location_scope`;
CREATE TABLE `stockmgmt_operation_type_location_scope` (
  `stock_operation_type_location_scope_id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_operation_type_id` int(11) NOT NULL,
  `location_tag` varchar(50) NOT NULL,
  `is_source` tinyint(1) NOT NULL DEFAULT 0,
  `is_destination` tinyint(1) NOT NULL DEFAULT 0,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`stock_operation_type_location_scope_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_operation_type_location_scope_creator_fk` (`creator`),
  KEY `stockmgmt_operation_type_location_scope_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_operation_type_location_scope_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_operation_type_loc_scope_on_operation_type_fk` (`stock_operation_type_id`),
  CONSTRAINT `stockmgmt_operation_type_loc_scope_on_operation_type_fk` FOREIGN KEY (`stock_operation_type_id`) REFERENCES `stockmgmt_stock_operation_type` (`stock_operation_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_order_item`;
CREATE TABLE `stockmgmt_order_item` (
  `order_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `stock_item_id` int(11) NOT NULL,
  `stock_item_packaging_uom_id` int(11) NOT NULL,
  `created_from` int(11) NOT NULL,
  `fulfilment_location_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_order_item_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_order_item_creator_fk` (`creator`),
  KEY `stockmgmt_order_item_stock_item_fk` (`stock_item_id`),
  KEY `stockmgmt_order_item_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_order_item_packaging_uom_fk` (`stock_item_packaging_uom_id`),
  KEY `stockmgmt_order_item_order_fk` (`order_id`),
  KEY `stockmgmt_order_item_created_from_fk` (`created_from`),
  KEY `stockmgmt_order_item_fulfilment_loc_fk` (`fulfilment_location_id`),
  CONSTRAINT `stockmgmt_order_item_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_order_item_created_from_fk` FOREIGN KEY (`created_from`) REFERENCES `location` (`location_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_order_item_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_order_item_fulfilment_loc_fk` FOREIGN KEY (`fulfilment_location_id`) REFERENCES `location` (`location_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_order_item_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_order_item_packaging_uom_fk` FOREIGN KEY (`stock_item_packaging_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_order_item_stock_item_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_order_item_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_party`;
CREATE TABLE `stockmgmt_party` (
  `party_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) DEFAULT NULL,
  `stock_source_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`party_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `stockmgmt_party_location_source_uk` (`location_id`,`stock_source_id`),
  KEY `stockmgmt_party_creator_fk` (`creator`),
  KEY `stockmgmt_party_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_party_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_party_stock_source_fk` (`stock_source_id`),
  CONSTRAINT `stockmgmt_party_location_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `stockmgmt_party_stock_source_fk` FOREIGN KEY (`stock_source_id`) REFERENCES `stockmgmt_stock_source` (`stock_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_reservation_transaction`;
CREATE TABLE `stockmgmt_reservation_transaction` (
  `stock_item_transaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_operation_id` int(11) DEFAULT NULL,
  `stock_operation_item_id` int(11) DEFAULT NULL,
  `stock_item_id` int(11) NOT NULL,
  `stock_item_packaging_uom_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `stock_batch_id` int(11) NOT NULL,
  `party_id` int(11) DEFAULT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `uuid` char(38) NOT NULL,
  `is_available` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`stock_item_transaction_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_reservation_transaction_batch_fk` (`stock_batch_id`),
  KEY `stockmgmt_reservation_transaction_creator_fk` (`creator`),
  KEY `stockmgmt_reservation_transaction_item_fk` (`stock_item_id`),
  KEY `stockmgmt_reservation_transaction_operation_fk` (`stock_operation_id`),
  KEY `stockmgmt_reservation_transaction_soi_fk` (`stock_operation_item_id`),
  KEY `stockmgmt_reservation_transaction_packaging_uom_fk` (`stock_item_packaging_uom_id`),
  KEY `stockmgmt_reservation_transaction_party_fk` (`party_id`),
  KEY `stockmgmt_reservation_transaction_patient_fk` (`patient_id`),
  CONSTRAINT `stockmgmt_reservation_transaction_batch_fk` FOREIGN KEY (`stock_batch_id`) REFERENCES `stockmgmt_stock_batch` (`stock_batch_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_reservation_transaction_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_reservation_transaction_item_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_reservation_transaction_operation_fk` FOREIGN KEY (`stock_operation_id`) REFERENCES `stockmgmt_stock_operation` (`stock_operation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_reservation_transaction_packaging_uom_fk` FOREIGN KEY (`stock_item_packaging_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_reservation_transaction_party_fk` FOREIGN KEY (`party_id`) REFERENCES `stockmgmt_party` (`party_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_reservation_transaction_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_reservation_transaction_soi_fk` FOREIGN KEY (`stock_operation_item_id`) REFERENCES `stockmgmt_stock_operation_item` (`stock_operation_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_batch`;
CREATE TABLE `stockmgmt_stock_batch` (
  `stock_batch_id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_item_id` int(11) NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `expiration` date DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `expiry_notification_date` datetime DEFAULT NULL,
  PRIMARY KEY (`stock_batch_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `stock_item_batch_no_expiration` (`stock_item_id`,`batch_no`,`expiration`),
  KEY `stockmgmt_stock_batch_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_batch_creator_fk` (`creator`),
  KEY `stockmgmt_stock_batch_stock_item_fk` (`stock_item_id`),
  KEY `stockmgmt_stock_batch_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_stock_batch_expiration_ix` (`expiration`,`expiry_notification_date`,`voided`),
  CONSTRAINT `stockmgmt_stock_batch_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_batch_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_batch_stock_item_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_batch_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_item`;
CREATE TABLE `stockmgmt_stock_item` (
  `stock_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `drug_id` int(11) DEFAULT NULL,
  `concept_id` int(11) DEFAULT NULL,
  `has_expiration` tinyint(1) NOT NULL DEFAULT 0,
  `preferred_vendor_id` int(11) DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `purchase_price_uom_id` int(11) DEFAULT NULL,
  `dispensing_unit_id` int(11) DEFAULT NULL,
  `dispensing_unit_packaging_uom_id` int(11) DEFAULT NULL,
  `default_stock_operations_uom_id` int(11) DEFAULT NULL,
  `common_name` varchar(255) DEFAULT NULL,
  `acronym` varchar(255) DEFAULT NULL,
  `is_drug` tinyint(1) NOT NULL,
  `reorder_level` decimal(10,2) DEFAULT NULL,
  `reorder_level_uom_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `expiry_notice` int(11) DEFAULT NULL,
  PRIMARY KEY (`stock_item_id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `drug_id_concept_id_index` (`drug_id`,`concept_id`),
  KEY `stockmgmt_stock_item_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_item_concept_id_fk` (`concept_id`),
  KEY `stockmgmt_stock_item_creator_fk` (`creator`),
  KEY `stockmgmt_stock_item_drug_id_fk` (`drug_id`),
  KEY `stockmgmt_stock_item_preferred_vendor_id_fk` (`preferred_vendor_id`),
  KEY `stockmgmt_stock_item_purchase_price_uom_id_fk` (`purchase_price_uom_id`),
  KEY `stockmgmt_stock_item_df_stock_operations_uom_id_fk` (`default_stock_operations_uom_id`),
  KEY `stockmgmt_stock_item_reorder_level_uom_id_fk` (`reorder_level_uom_id`),
  KEY `stockmgmt_stock_item_du_packaging_uom_id_fk` (`dispensing_unit_packaging_uom_id`),
  KEY `stockmgmt_stock_item_dispensing_unit_id_fk` (`dispensing_unit_id`),
  KEY `stockmgmt_stock_item_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_stock_item_category_id_fk` (`category_id`),
  CONSTRAINT `stockmgmt_stock_item_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `concept` (`concept_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_concept_id_fk` FOREIGN KEY (`concept_id`) REFERENCES `concept` (`concept_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_df_stock_operations_uom_id_fk` FOREIGN KEY (`default_stock_operations_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_dispensing_unit_id_fk` FOREIGN KEY (`dispensing_unit_id`) REFERENCES `concept` (`concept_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_drug_id_fk` FOREIGN KEY (`drug_id`) REFERENCES `drug` (`drug_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_du_packaging_uom_id_fk` FOREIGN KEY (`dispensing_unit_packaging_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_preferred_vendor_id_fk` FOREIGN KEY (`preferred_vendor_id`) REFERENCES `stockmgmt_stock_source` (`stock_source_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_purchase_price_uom_id_fk` FOREIGN KEY (`purchase_price_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_reorder_level_uom_id_fk` FOREIGN KEY (`reorder_level_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_item_packaging_uom`;
CREATE TABLE `stockmgmt_stock_item_packaging_uom` (
  `stock_item_packaging_uom_id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_item_id` int(11) NOT NULL,
  `packaging_uom_id` int(11) DEFAULT NULL,
  `factor` decimal(10,2) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`stock_item_packaging_uom_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_stock_item_packaging_uom_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_item_packaging_uom_concept_fk` (`packaging_uom_id`),
  KEY `stockmgmt_stock_item_packaging_uom_creator_fk` (`creator`),
  KEY `stockmgmt_stock_item_packaging_uom_stock_item_fk` (`stock_item_id`),
  KEY `stockmgmt_stock_item_packaging_uom_voided_by_fk` (`voided_by`),
  CONSTRAINT `stockmgmt_stock_item_packaging_uom_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_packaging_uom_concept_fk` FOREIGN KEY (`packaging_uom_id`) REFERENCES `concept` (`concept_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_packaging_uom_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_packaging_uom_stock_item_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_packaging_uom_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_item_reference`;
CREATE TABLE `stockmgmt_stock_item_reference` (
  `stock_item_reference_id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_source_id` int(11) NOT NULL,
  `stock_item_id` int(11) NOT NULL,
  `stock_reference_code` varchar(255) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` date DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` date DEFAULT NULL,
  `voided` tinyint(1) DEFAULT NULL,
  `date_voided` date DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` varchar(38) NOT NULL DEFAULT 'false',
  PRIMARY KEY (`stock_item_reference_id`),
  UNIQUE KEY `stockmgmt_stock_item_reference_source_code_pk` (`stock_reference_code`,`stock_source_id`),
  KEY `stock_item_reference_stock_item_stock_item_id_fk` (`stock_item_id`),
  KEY `stock_item_reference_stock_source_stock_source_id_fk` (`stock_source_id`),
  KEY `stock_item_reference_users_changed_by_id_fk` (`changed_by`),
  KEY `stock_item_reference_users_creator_id_fk` (`creator`),
  KEY `stock_item_reference_users_voided_by_id_fk` (`voided_by`),
  CONSTRAINT `stock_item_reference_stock_item_stock_item_id_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`),
  CONSTRAINT `stock_item_reference_stock_source_stock_source_id_fk` FOREIGN KEY (`stock_source_id`) REFERENCES `stockmgmt_stock_source` (`stock_source_id`),
  CONSTRAINT `stock_item_reference_users_changed_by_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `stock_item_reference_users_creator_id_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `stock_item_reference_users_voided_by_id_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_item_transaction`;
CREATE TABLE `stockmgmt_stock_item_transaction` (
  `stock_item_transaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_operation_id` int(11) DEFAULT NULL,
  `stock_operation_item_id` int(11) DEFAULT NULL,
  `stock_item_id` int(11) NOT NULL,
  `stock_item_packaging_uom_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `stock_batch_id` int(11) NOT NULL,
  `party_id` int(11) DEFAULT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `encounter_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`stock_item_transaction_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_stock_item_transaction_batch_fk` (`stock_batch_id`),
  KEY `stockmgmt_stock_item_transaction_creator_fk` (`creator`),
  KEY `stockmgmt_stock_item_transaction_item_fk` (`stock_item_id`),
  KEY `stockmgmt_stock_item_transaction_operation_fk` (`stock_operation_id`),
  KEY `stockmgmt_stock_item_transaction_soi_fk` (`stock_operation_item_id`),
  KEY `stockmgmt_stock_item_transaction_packaging_uom_fk` (`stock_item_packaging_uom_id`),
  KEY `stockmgmt_stock_item_transaction_party_fk` (`party_id`),
  KEY `stockmgmt_stock_item_transaction_patient_fk` (`patient_id`),
  KEY `stockmgmt_stock_item_transaction_order_fk` (`order_id`),
  KEY `stockmgmt_stock_item_transaction_encounter_fk` (`encounter_id`),
  KEY `stockmgmt_stock_item_transaction_itemsearch_fk` (`party_id`,`stock_item_id`,`stock_batch_id`,`date_created`),
  KEY `stockmgmt_stock_item_txn_itemsearch_date_fk` (`party_id`,`stock_item_id`,`date_created`),
  CONSTRAINT `stockmgmt_stock_item_transaction_batch_fk` FOREIGN KEY (`stock_batch_id`) REFERENCES `stockmgmt_stock_batch` (`stock_batch_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_encounter_fk` FOREIGN KEY (`encounter_id`) REFERENCES `encounter` (`encounter_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_item_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_operation_fk` FOREIGN KEY (`stock_operation_id`) REFERENCES `stockmgmt_stock_operation` (`stock_operation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_order_fk` FOREIGN KEY (`order_id`) REFERENCES `drug_order` (`order_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_packaging_uom_fk` FOREIGN KEY (`stock_item_packaging_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_party_fk` FOREIGN KEY (`party_id`) REFERENCES `stockmgmt_party` (`party_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_item_transaction_soi_fk` FOREIGN KEY (`stock_operation_item_id`) REFERENCES `stockmgmt_stock_operation_item` (`stock_operation_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_operation`;
CREATE TABLE `stockmgmt_stock_operation` (
  `stock_operation_id` int(11) NOT NULL AUTO_INCREMENT,
  `operation_type_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `operation_date` datetime NOT NULL,
  `operation_number` varchar(255) DEFAULT NULL,
  `external_reference` varchar(50) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `reason_id` int(11) DEFAULT NULL,
  `at_location_id` int(11) NOT NULL,
  `source_id` int(11) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `operation_order` int(11) DEFAULT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT 0,
  `completed_by` int(11) DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  `cancelled_by` int(11) DEFAULT NULL,
  `cancelled_date` datetime DEFAULT NULL,
  `cancel_reason` varchar(500) DEFAULT NULL,
  `return_reason` varchar(500) DEFAULT NULL,
  `reject_reason` varchar(500) DEFAULT NULL,
  `approval_required` tinyint(1) DEFAULT NULL,
  `responsible_person` int(11) DEFAULT NULL,
  `responsible_person_other` varchar(150) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_date` datetime DEFAULT NULL,
  `dispatched_by` int(11) DEFAULT NULL,
  `dispatched_date` datetime DEFAULT NULL,
  `returned_by` int(11) DEFAULT NULL,
  `returned_date` datetime DEFAULT NULL,
  `rejected_by` int(11) DEFAULT NULL,
  `rejected_date` datetime DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`stock_operation_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_stock_operation_cancelled_by_fk` (`cancelled_by`),
  KEY `stockmgmt_stock_operation_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_operation_completed_by_fk` (`completed_by`),
  KEY `stockmgmt_stock_operation_submitted_by_fk` (`submitted_by`),
  KEY `stockmgmt_stock_operation_dispatched_by_fk` (`dispatched_by`),
  KEY `stockmgmt_stock_operation_returned_by_fk` (`returned_by`),
  KEY `stockmgmt_stock_operation_rejected_by_fk` (`rejected_by`),
  KEY `stockmgmt_stock_operation_creator_fk` (`creator`),
  KEY `stockmgmt_stock_operation_destination_fk` (`destination_id`),
  KEY `stockmgmt_stock_operation_location_fk` (`at_location_id`),
  KEY `stockmgmt_stock_operation_reason_fk` (`reason_id`),
  KEY `stockmgmt_stock_operation_source_fk` (`source_id`),
  KEY `stockmgmt_stock_operation_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_so_responsible_person_fk` (`responsible_person`),
  KEY `stockmgmt_stock_operation_operation_type_fk` (`operation_type_id`),
  CONSTRAINT `stockmgmt_so_responsible_person_fk` FOREIGN KEY (`responsible_person`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_cancelled_by_fk` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_completed_by_fk` FOREIGN KEY (`completed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_destination_fk` FOREIGN KEY (`destination_id`) REFERENCES `stockmgmt_party` (`party_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_dispatched_by_fk` FOREIGN KEY (`dispatched_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_location_fk` FOREIGN KEY (`at_location_id`) REFERENCES `location` (`location_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_operation_type_fk` FOREIGN KEY (`operation_type_id`) REFERENCES `stockmgmt_stock_operation_type` (`stock_operation_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_reason_fk` FOREIGN KEY (`reason_id`) REFERENCES `concept` (`concept_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_rejected_by_fk` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_returned_by_fk` FOREIGN KEY (`returned_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_source_fk` FOREIGN KEY (`source_id`) REFERENCES `stockmgmt_party` (`party_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_submitted_by_fk` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_operation_item`;
CREATE TABLE `stockmgmt_stock_operation_item` (
  `stock_operation_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_operation_id` int(11) NOT NULL,
  `stock_item_id` int(11) NOT NULL,
  `stock_item_packaging_uom_id` int(11) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `stock_batch_id` int(11) DEFAULT NULL,
  `qty_rcvd_packaging_uom_id` int(11) DEFAULT NULL,
  `quantity_received` decimal(10,2) DEFAULT NULL,
  `quantity_requested` decimal(10,2) DEFAULT NULL,
  `qty_req_packaging_uom_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `date_voided` datetime DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`stock_operation_item_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_stock_operation_item_creator_fk` (`creator`),
  KEY `stockmgmt_stock_operation_item_batch_fk` (`stock_batch_id`),
  KEY `stockmgmt_stock_operation_item_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_operation_item_packaging_uom_fk` (`stock_item_packaging_uom_id`),
  KEY `stockmgmt_stock_oi_qty_rcvd_pkg_uom_fk` (`qty_rcvd_packaging_uom_id`),
  KEY `stockmgmt_stock_oi_qty_req_pkg_uom_fk` (`qty_req_packaging_uom_id`),
  KEY `stockmgmt_stock_operation_item_stock_item_fk` (`stock_item_id`),
  KEY `stockmgmt_stock_operation_item_stock_operation_fk` (`stock_operation_id`),
  KEY `stockmgmt_stock_operation_item_voided_by_fk` (`voided_by`),
  CONSTRAINT `stockmgmt_stock_oi_qty_rcvd_pkg_uom_fk` FOREIGN KEY (`qty_rcvd_packaging_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_oi_qty_req_pkg_uom_fk` FOREIGN KEY (`qty_req_packaging_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_item_batch_fk` FOREIGN KEY (`stock_batch_id`) REFERENCES `stockmgmt_stock_batch` (`stock_batch_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_item_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_item_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_item_packaging_uom_fk` FOREIGN KEY (`stock_item_packaging_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_item_stock_item_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_item_stock_op_fk` FOREIGN KEY (`stock_operation_id`) REFERENCES `stockmgmt_stock_operation` (`stock_operation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_item_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_operation_link`;
CREATE TABLE `stockmgmt_stock_operation_link` (
  `stock_operation_link_id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_stock_operation_id` int(11) NOT NULL,
  `child_stock_operation_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`stock_operation_link_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_stock_operation_link_creator_fk` (`creator`),
  KEY `stockmgmt_stock_operation_link_pso_fk` (`parent_stock_operation_id`),
  KEY `stockmgmt_stock_operation_link_cso_fk` (`child_stock_operation_id`),
  KEY `stockmgmt_stock_operation_link_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_operation_link_voided_by_fk` (`voided_by`),
  CONSTRAINT `stockmgmt_stock_operation_link_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_link_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_link_cso_fk` FOREIGN KEY (`child_stock_operation_id`) REFERENCES `stockmgmt_stock_operation` (`stock_operation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_link_pso_fk` FOREIGN KEY (`parent_stock_operation_id`) REFERENCES `stockmgmt_stock_operation` (`stock_operation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_link_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_operation_type`;
CREATE TABLE `stockmgmt_stock_operation_type` (
  `stock_operation_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(1024) DEFAULT '',
  `operation_type` varchar(255) NOT NULL,
  `has_source` tinyint(1) DEFAULT NULL,
  `source_type` varchar(50) DEFAULT NULL,
  `has_destination` tinyint(1) DEFAULT NULL,
  `destination_type` varchar(50) DEFAULT NULL,
  `acronym` varchar(10) DEFAULT NULL,
  `available_when_reserved` tinyint(1) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `notify_submitted` tinyint(1) NOT NULL DEFAULT 0,
  `notify_approved` tinyint(1) NOT NULL DEFAULT 0,
  `notify_completed` tinyint(1) NOT NULL DEFAULT 0,
  `notify_cancelled` tinyint(1) NOT NULL DEFAULT 0,
  `notify_rejected` tinyint(1) NOT NULL DEFAULT 0,
  `notify_returned` tinyint(1) NOT NULL DEFAULT 0,
  `notify_dispatched` tinyint(1) NOT NULL DEFAULT 0,
  `allow_expired_batch_numbers` tinyint(1) NOT NULL DEFAULT 0,
  `allow_batch_info_update` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`stock_operation_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_stock_operation_type_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_operation_type_creator_fk` (`creator`),
  KEY `stockmgmt_stock_operation_type_voided_by_fk` (`voided_by`),
  CONSTRAINT `stockmgmt_stock_operation_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_operation_type_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_rule`;
CREATE TABLE `stockmgmt_stock_rule` (
  `stock_rule_id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_item_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `location_id` int(11) NOT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `stock_item_packaging_uom_id` int(11) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL,
  `evaluation_frequency` bigint(20) NOT NULL,
  `last_evaluation` datetime DEFAULT NULL,
  `next_evaluation` datetime DEFAULT NULL,
  `action_frequency` bigint(20) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `alert_role` varchar(50) DEFAULT NULL,
  `mail_role` varchar(50) DEFAULT NULL,
  `last_action_date` datetime DEFAULT NULL,
  `enable_descendants` tinyint(1) NOT NULL DEFAULT 0,
  `next_action_date` datetime DEFAULT NULL,
  PRIMARY KEY (`stock_rule_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_stock_rule_creator_fk` (`creator`),
  KEY `stockmgmt_stock_rule_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_rule_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_stock_rule_on_stock_item_fk` (`stock_item_id`),
  KEY `stockmgmt_stock_rule_on_stock_item_packaging_uom_fk` (`stock_item_packaging_uom_id`),
  KEY `stockmgmt_stock_rule_on_location_fk` (`location_id`),
  CONSTRAINT `stockmgmt_stock_rule_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_rule_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_rule_on_location_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `stockmgmt_stock_rule_on_stock_item_fk` FOREIGN KEY (`stock_item_id`) REFERENCES `stockmgmt_stock_item` (`stock_item_id`),
  CONSTRAINT `stockmgmt_stock_rule_on_stock_item_packaging_uom_fk` FOREIGN KEY (`stock_item_packaging_uom_id`) REFERENCES `stockmgmt_stock_item_packaging_uom` (`stock_item_packaging_uom_id`),
  CONSTRAINT `stockmgmt_stock_rule_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_stock_source`;
CREATE TABLE `stockmgmt_stock_source` (
  `stock_source_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `acronym` varchar(255) NOT NULL,
  `source_type_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`stock_source_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_stock_source_type_fk` (`source_type_id`),
  KEY `stockmgmt_stock_source_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_stock_source_creator_fk` (`creator`),
  KEY `stockmgmt_stock_source_voided_by_fk` (`voided_by`),
  CONSTRAINT `stockmgmt_stock_source_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_source_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_source_type_fk` FOREIGN KEY (`source_type_id`) REFERENCES `concept` (`concept_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_stock_source_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_user_role_scope`;
CREATE TABLE `stockmgmt_user_role_scope` (
  `user_role_scope_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role` varchar(50) NOT NULL,
  `is_permanent` tinyint(1) NOT NULL,
  `active_from` datetime DEFAULT NULL,
  `active_to` datetime DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`user_role_scope_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_user_role_scope_creator_fk` (`creator`),
  KEY `stockmgmt_user_role_scope_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_user_role_scope_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_user_role_scope_user_fk` (`user_id`),
  KEY `stockmgmt_user_role_scope_role_fk` (`role`),
  CONSTRAINT `stockmgmt_user_role_scope_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_user_role_scope_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_user_role_scope_role_fk` FOREIGN KEY (`role`) REFERENCES `role` (`role`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_user_role_scope_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_user_role_scope_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_user_role_scope_location`;
CREATE TABLE `stockmgmt_user_role_scope_location` (
  `user_role_scope_location_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_role_scope_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `enable_descendants` tinyint(1) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`user_role_scope_location_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_user_role_scope_location_creator_fk` (`creator`),
  KEY `stockmgmt_user_role_scope_location_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_user_role_scope_location_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_user_role_scope_location_on_user_role_scope_fk` (`user_role_scope_id`),
  CONSTRAINT `stockmgmt_user_role_scope_location_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_user_role_scope_location_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_user_role_scope_location_on_user_role_scope_fk` FOREIGN KEY (`user_role_scope_id`) REFERENCES `stockmgmt_user_role_scope` (`user_role_scope_id`),
  CONSTRAINT `stockmgmt_user_role_scope_location_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `stockmgmt_user_role_scope_operation_type`;
CREATE TABLE `stockmgmt_user_role_scope_operation_type` (
  `user_role_scope_operation_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_role_scope_id` int(11) NOT NULL,
  `operation_type_id` int(11) NOT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`user_role_scope_operation_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `stockmgmt_user_role_scope_operation_type_creator_fk` (`creator`),
  KEY `stockmgmt_user_role_scope_operation_type_changed_by_fk` (`changed_by`),
  KEY `stockmgmt_user_role_scope_operation_type_voided_by_fk` (`voided_by`),
  KEY `stockmgmt_user_role_scope_operation_type_on_operation_type_fk` (`operation_type_id`),
  KEY `stockmgmt_user_role_scope_operation_type_on_user_role_scope_fk` (`user_role_scope_id`),
  CONSTRAINT `stockmgmt_user_role_scope_operation_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_user_role_scope_operation_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `stockmgmt_user_role_scope_operation_type_on_operation_type_fk` FOREIGN KEY (`operation_type_id`) REFERENCES `stockmgmt_stock_operation_type` (`stock_operation_type_id`),
  CONSTRAINT `stockmgmt_user_role_scope_operation_type_on_user_role_scope_fk` FOREIGN KEY (`user_role_scope_id`) REFERENCES `stockmgmt_user_role_scope` (`user_role_scope_id`),
  CONSTRAINT `stockmgmt_user_role_scope_operation_type_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `tasks_systemtask`;
CREATE TABLE `tasks_systemtask` (
  `tasks_systemtask_id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` varchar(50) DEFAULT NULL,
  `default_assignee_provider_role_id` int(11) DEFAULT NULL,
  `rationale` text DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tasks_systemtask_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `tasks_systemtask_creator_fk` (`creator`),
  KEY `tasks_systemtask_changed_by_fk` (`changed_by`),
  KEY `tasks_systemtask_retired_by_fk` (`retired_by`),
  KEY `tasks_systemtask_default_assignee_role_fk` (`default_assignee_provider_role_id`),
  CONSTRAINT `tasks_systemtask_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `tasks_systemtask_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `tasks_systemtask_default_assignee_role_fk` FOREIGN KEY (`default_assignee_provider_role_id`) REFERENCES `provider_role` (`provider_role_id`),
  CONSTRAINT `tasks_systemtask_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `tasks_task`;
CREATE TABLE `tasks_task` (
  `tasks_task_id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(38) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `system_task_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `assignee_provider_id` int(11) DEFAULT NULL,
  `assignee_provider_role_id` int(11) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `due_date_type` varchar(50) DEFAULT NULL,
  `due_date_reference_visit_id` int(11) DEFAULT NULL,
  `rationale` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `kind` varchar(50) DEFAULT NULL,
  `priority` varchar(50) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tasks_task_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `tasks_task_assignee_provider_fk` (`assignee_provider_id`),
  KEY `tasks_task_creator_fk` (`creator`),
  KEY `tasks_task_changed_by_fk` (`changed_by`),
  KEY `tasks_task_voided_by_fk` (`voided_by`),
  KEY `tasks_task_due_date_reference_visit_fk` (`due_date_reference_visit_id`),
  KEY `tasks_task_assignee_provider_role_fk` (`assignee_provider_role_id`),
  KEY `tasks_task_patient_voided_idx` (`patient_id`,`voided`),
  KEY `tasks_task_system_task_idx` (`system_task_id`),
  CONSTRAINT `tasks_task_assignee_provider_fk` FOREIGN KEY (`assignee_provider_id`) REFERENCES `provider` (`provider_id`),
  CONSTRAINT `tasks_task_assignee_provider_role_fk` FOREIGN KEY (`assignee_provider_role_id`) REFERENCES `provider_role` (`provider_role_id`),
  CONSTRAINT `tasks_task_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `tasks_task_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `tasks_task_due_date_reference_visit_fk` FOREIGN KEY (`due_date_reference_visit_id`) REFERENCES `visit` (`visit_id`),
  CONSTRAINT `tasks_task_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `tasks_task_system_task_fk` FOREIGN KEY (`system_task_id`) REFERENCES `tasks_systemtask` (`tasks_systemtask_id`),
  CONSTRAINT `tasks_task_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `test_order`;
CREATE TABLE `test_order` (
  `order_id` int(11) NOT NULL DEFAULT 0,
  `specimen_source` int(11) DEFAULT NULL,
  `laterality` varchar(20) DEFAULT NULL,
  `clinical_history` text DEFAULT NULL,
  `frequency` int(11) DEFAULT NULL,
  `number_of_repeats` int(11) DEFAULT NULL,
  `location` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `test_order_frequency_fk` (`frequency`),
  KEY `test_order_location_fk` (`location`),
  KEY `test_order_specimen_source_fk` (`specimen_source`),
  CONSTRAINT `test_order_frequency_fk` FOREIGN KEY (`frequency`) REFERENCES `order_frequency` (`order_frequency_id`),
  CONSTRAINT `test_order_location_fk` FOREIGN KEY (`location`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `test_order_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `test_order_specimen_source_fk` FOREIGN KEY (`specimen_source`) REFERENCES `concept` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `system_id` varchar(50) NOT NULL DEFAULT '',
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(128) DEFAULT NULL,
  `salt` varchar(128) DEFAULT NULL,
  `secret_question` varchar(255) DEFAULT NULL,
  `secret_answer` varchar(255) DEFAULT NULL,
  `creator` int(11) NOT NULL DEFAULT 0,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `person_id` int(11) NOT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  `activation_key` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `person_id_for_user` (`person_id`),
  KEY `user_creator` (`creator`),
  KEY `user_who_changed_user` (`changed_by`),
  KEY `user_who_retired_this_user` (`retired_by`),
  CONSTRAINT `person_id_for_user` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`),
  CONSTRAINT `user_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_who_changed_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_who_retired_this_user` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `user_property`;
CREATE TABLE `user_property` (
  `user_id` int(11) NOT NULL DEFAULT 0,
  `property` varchar(255) NOT NULL,
  `property_value` longtext DEFAULT NULL,
  PRIMARY KEY (`user_id`,`property`),
  CONSTRAINT `user_property_to_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role` (
  `user_id` int(11) NOT NULL DEFAULT 0,
  `role` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`user_id`,`role`),
  KEY `role_definitions` (`role`),
  KEY `user_role_to_users` (`user_id`),
  CONSTRAINT `role_definitions` FOREIGN KEY (`role`) REFERENCES `role` (`role`),
  CONSTRAINT `user_role_to_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `visit`;
CREATE TABLE `visit` (
  `visit_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `visit_type_id` int(11) NOT NULL,
  `date_started` datetime NOT NULL,
  `date_stopped` datetime DEFAULT NULL,
  `indication_concept_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`visit_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `visit_changed_by_fk` (`changed_by`),
  KEY `visit_creator_fk` (`creator`),
  KEY `visit_indication_concept_fk` (`indication_concept_id`),
  KEY `visit_location_fk` (`location_id`),
  KEY `visit_patient_index` (`patient_id`),
  KEY `visit_type_fk` (`visit_type_id`),
  KEY `visit_voided_by_fk` (`voided_by`),
  CONSTRAINT `visit_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `visit_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `visit_indication_concept_fk` FOREIGN KEY (`indication_concept_id`) REFERENCES `concept` (`concept_id`),
  CONSTRAINT `visit_location_fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `visit_patient_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `visit_type_fk` FOREIGN KEY (`visit_type_id`) REFERENCES `visit_type` (`visit_type_id`),
  CONSTRAINT `visit_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `visit_attribute`;
CREATE TABLE `visit_attribute` (
  `visit_attribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `visit_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  `value_reference` text NOT NULL,
  `uuid` char(38) NOT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT 0,
  `voided_by` int(11) DEFAULT NULL,
  `date_voided` datetime DEFAULT NULL,
  `void_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`visit_attribute_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `visit_attribute_attribute_type_id_fk` (`attribute_type_id`),
  KEY `visit_attribute_changed_by_fk` (`changed_by`),
  KEY `visit_attribute_creator_fk` (`creator`),
  KEY `visit_attribute_visit_fk` (`visit_id`),
  KEY `visit_attribute_voided_by_fk` (`voided_by`),
  CONSTRAINT `visit_attribute_attribute_type_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `visit_attribute_type` (`visit_attribute_type_id`),
  CONSTRAINT `visit_attribute_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `visit_attribute_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `visit_attribute_visit_fk` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`),
  CONSTRAINT `visit_attribute_voided_by_fk` FOREIGN KEY (`voided_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `visit_attribute_type`;
CREATE TABLE `visit_attribute_type` (
  `visit_attribute_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `datatype` varchar(255) DEFAULT NULL,
  `datatype_config` text DEFAULT NULL,
  `preferred_handler` varchar(255) DEFAULT NULL,
  `handler_config` text DEFAULT NULL,
  `min_occurs` int(11) NOT NULL,
  `max_occurs` int(11) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`visit_attribute_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `visit_attribute_type_changed_by_fk` (`changed_by`),
  KEY `visit_attribute_type_creator_fk` (`creator`),
  KEY `visit_attribute_type_retired_by_fk` (`retired_by`),
  CONSTRAINT `visit_attribute_type_changed_by_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `visit_attribute_type_creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `visit_attribute_type_retired_by_fk` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `visit_type`;
CREATE TABLE `visit_type` (
  `visit_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `creator` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `date_changed` datetime DEFAULT NULL,
  `retired` tinyint(1) NOT NULL DEFAULT 0,
  `retired_by` int(11) DEFAULT NULL,
  `date_retired` datetime DEFAULT NULL,
  `retire_reason` varchar(255) DEFAULT NULL,
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`visit_type_id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `visit_type_changed_by` (`changed_by`),
  KEY `visit_type_creator` (`creator`),
  KEY `visit_type_retired_by` (`retired_by`),
  CONSTRAINT `visit_type_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `visit_type_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `visit_type_retired_by` FOREIGN KEY (`retired_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2026-09-09 08:24:50 UTC
