-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 12, 2026 at 08:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `biims`
--

-- --------------------------------------------------------

--
-- Table structure for table `accomplishment_reports`
--

CREATE TABLE `accomplishment_reports` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `description` text DEFAULT NULL,
  `status_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accomplishment_reports`
--

INSERT INTO `accomplishment_reports` (`id`, `student_id`, `task_id`, `date`, `description`, `status_id`, `created_at`, `updated_at`) VALUES
(4, 2, 5, '2026-03-20', 'Completed the weekly filing tracker and verified all attached forms before submission.', 3, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(5, 8, 6, '2026-03-20', 'Encoded 75% of the assigned inventory records and flagged missing item codes for follow-up.', 4, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(6, 9, 8, '2026-03-20', 'Assisted in drafting the operations report and finalized the summary table for review.', 3, '2026-03-20 10:11:55', '2026-03-20 10:11:55');

-- --------------------------------------------------------

--
-- Table structure for table `accomplishment_reviews`
--

CREATE TABLE `accomplishment_reviews` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `decision` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `reviewed_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accomplishment_reviews`
--

INSERT INTO `accomplishment_reviews` (`id`, `report_id`, `reviewer_id`, `decision`, `note`, `reviewed_at`, `created_at`) VALUES
(4, 4, 3, 'Approved', 'Well-written summary and complete supporting details.', '2026-03-20 18:11:56', '2026-03-20 10:11:56'),
(5, 5, 3, 'Needs Revision', 'Please clarify the missing item code issue before final approval.', '2026-03-20 18:11:56', '2026-03-20 10:11:56'),
(6, 6, 3, 'Approved', 'Good structure and complete observations.', '2026-03-20 18:11:56', '2026-03-20 10:11:56');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `am_arrival` time DEFAULT NULL,
  `am_departure` time DEFAULT NULL,
  `pm_arrival` time DEFAULT NULL,
  `pm_departure` time DEFAULT NULL,
  `activity_summary` text DEFAULT NULL,
  `undertime_hours` int(11) DEFAULT NULL,
  `undertime_mins` int(11) DEFAULT NULL,
  `status_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `student_id`, `date`, `am_arrival`, `am_departure`, `pm_arrival`, `pm_departure`, `activity_summary`, `undertime_hours`, `undertime_mins`, `status_id`, `created_at`, `updated_at`) VALUES
(12, 2, '2026-03-17', '07:48:00', '12:00:00', '13:01:00', '17:06:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-28 04:09:19'),
(13, 2, '2026-03-18', '07:55:00', '12:03:00', '12:58:00', '17:02:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-28 04:09:19'),
(14, 2, '2026-03-19', '08:06:00', '12:04:00', '13:00:00', '17:08:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-28 04:09:19'),
(15, 7, '2026-03-17', '07:51:00', '12:01:00', '12:59:00', '17:04:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(16, 7, '2026-03-18', '08:11:00', '12:02:00', '13:05:00', '17:12:00', NULL, 0, 0, 2, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(17, 7, '2026-03-19', '07:49:00', '12:00:00', '12:56:00', '17:00:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(18, 8, '2026-03-18', '07:45:00', '12:01:00', '13:00:00', '17:05:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(19, 8, '2026-03-19', '07:47:00', '12:02:00', '12:58:00', '17:03:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(20, 9, '2026-03-17', '07:44:00', '12:00:00', '12:57:00', '17:01:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(21, 9, '2026-03-18', '07:46:00', '12:01:00', '13:00:00', '17:02:00', NULL, 0, 0, 5, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(22, 2, '2026-03-30', '11:52:48', '11:53:07', '11:53:10', '11:53:16', NULL, 8, 0, 2, '2026-03-30 09:52:49', '2026-03-30 09:53:16'),
(23, 2, '2026-03-31', '16:57:26', '16:57:30', NULL, NULL, NULL, 8, 0, 2, '2026-03-31 14:57:26', '2026-03-31 14:57:30'),
(24, 2, '2026-04-05', '01:20:00', '07:27:00', '07:27:00', '07:27:00', NULL, 0, 0, 5, '2026-04-04 23:20:22', '2026-04-06 06:40:51'),
(25, 2, '2026-04-06', '14:23:00', '14:23:00', '14:23:00', '14:23:00', NULL, 8, 0, 2, '2026-04-06 06:23:28', '2026-04-06 06:40:51'),
(26, 16, '2026-04-08', '11:17:19', NULL, NULL, NULL, NULL, 8, 0, 2, '2026-04-08 03:17:19', '2026-04-08 03:17:19');

-- --------------------------------------------------------

--
-- Table structure for table `college`
--

CREATE TABLE `college` (
  `college_id` int(11) NOT NULL,
  `college_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `college`
--

INSERT INTO `college` (`college_id`, `college_name`) VALUES
(1, 'College of Sciences'),
(2, 'College of Business Management'),
(3, 'College of Fisheries and Marine Sciences'),
(4, 'College of Teacher Education');

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(255) NOT NULL,
  `college_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`department_id`, `department_name`, `college_id`) VALUES
(1, 'Computer Science', 1),
(2, 'Hospitality Management', 2),
(3, 'Office Administration', 2),
(4, 'Marine Biology', 3),
(5, 'Environmental Resource Management', 1),
(6, 'Teacher Education', 4);

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `evaluation_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `hte_rating_weight` decimal(10,2) DEFAULT NULL,
  `coordinator_rating_weight` decimal(10,2) DEFAULT NULL,
  `overall_final_grade` decimal(10,2) DEFAULT NULL,
  `comments_suggestions` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluations`
--

INSERT INTO `evaluations` (`evaluation_id`, `assignment_id`, `evaluator_id`, `hte_rating_weight`, `coordinator_rating_weight`, `overall_final_grade`, `comments_suggestions`, `created_at`, `updated_at`) VALUES
(4, 7, 3, 1.75, 1.75, 1.75, 'Shows strong initiative and consistent documentation performance.', '2026-03-20 10:11:56', '2026-03-20 10:11:56'),
(5, 11, 3, 1.50, 1.50, 1.50, 'Reliable, organized, and ready for final presentation tasks.', '2026-03-20 10:11:56', '2026-03-20 10:11:56'),
(6, 12, 15, 55.01, 0.00, 2.33, '[initial] The student performs assigned tasks well and communicates clearly. Work quality is good and the student shows initiative. However, discipline needs improvement in terms of punctuality, consistency, and compliance with instructions.', '2026-04-07 09:20:58', '2026-04-07 09:20:58');

-- --------------------------------------------------------

--
-- Table structure for table `hte`
--

CREATE TABLE `hte` (
  `hte_id` int(11) NOT NULL,
  `hte_address` varchar(255) NOT NULL,
  `hte_name` varchar(255) NOT NULL,
  `supervisor_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hte`
--

INSERT INTO `hte` (`hte_id`, `hte_address`, `hte_name`, `supervisor_user_id`, `created_at`, `updated_at`) VALUES
(1, 'Poblacion, Candijay, Bohol', 'Demo Company', 3, '2026-03-10 05:44:16', '2026-03-20 10:11:55'),
(2, 'CPG Avenue, Tagbilaran City', 'Alturas', 13, '2026-03-11 03:46:28', '2026-03-30 10:07:35'),
(3, 'Municipal Hall, Candijay, Bohol', 'LGU Candijay IT Office', 12, '2026-03-20 10:11:12', '2026-03-27 23:44:22'),
(4, 'Tagbilaran', 'IBEX', 15, '2026-04-05 00:38:32', '2026-04-05 00:38:32'),
(5, 'Cebu', 'GECKO Solution', 15, '2026-04-07 08:29:46', '2026-04-07 08:29:46');

-- --------------------------------------------------------

--
-- Table structure for table `hte_feedback`
--

CREATE TABLE `hte_feedback` (
  `feedback_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `overall_comments` text DEFAULT NULL,
  `rating_summary` text DEFAULT NULL,
  `rating_average` decimal(4,2) DEFAULT NULL,
  `date_submitted` datetime NOT NULL,
  `ai_summary` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hte_feedback`
--

INSERT INTO `hte_feedback` (`feedback_id`, `assignment_id`, `user_id`, `overall_comments`, `rating_summary`, `rating_average`, `date_submitted`, `ai_summary`, `created_at`, `updated_at`) VALUES
(6, 7, 3, 'Shows strong initiative, learns tasks quickly, and keeps documentation complete. Attendance is mostly consistent with only one noted late arrival.', NULL, NULL, '2026-03-20 18:11:56', 'The employee consistently demonstrates strong initiative, rapid task assimilation, and thorough documentation practices. A key area for improvement is ensuring consistent punctuality, as one late arrival was noted.', '2026-03-20 10:11:56', '2026-03-28 04:04:09'),
(7, 10, 3, 'Needs clearer accomplishment narratives, but task ownership is improving. Student responds well to detailed revision notes.', NULL, NULL, '2026-03-20 18:11:56', 'The student demonstrates improving task ownership and responsiveness to detailed revision notes. Future development should focus on crafting clearer accomplishment narratives.', '2026-03-20 10:11:56', '2026-03-28 03:37:48'),
(8, 11, 3, 'Consistently dependable during operations support. Work quality is organized and presentation-ready.', NULL, NULL, '2026-03-20 18:11:56', 'The employee consistently demonstrates dependable operations support and delivers organized, presentation-ready work. Focus should be placed on developing proactive problem-solving skills to anticipate and address issues before they arise.', '2026-03-20 10:11:56', '2026-03-28 03:37:51'),
(14, 8, 3, 'The student shows a strong sense of responsibility by arriving on time and completing assigned duties consistently. They work well with others and maintain a professional attitude throughout their tasks. Continued focus on initiative and attention to detail will help them grow further in the workplace', 'Average rating: 1.00 from 15 rated item(s)', 1.00, '2026-03-28 11:22:50', 'The student consistently demonstrates strong responsibility and professionalism in their collaborative work. Further development should focus on enhancing initiative and meticulous attention to detail.', '2026-03-28 03:22:50', '2026-03-28 13:05:22'),
(15, 8, 3, 'The student shows a strong sense of responsibility by arriving on time and completing assigned duties consistently. They work well with others and maintain a professional attitude throughout their tasks. Continued focus on initiative and attention to detail will help them grow further in the workplace', 'Average rating: 1.00 from 15 rated item(s)', 1.00, '2026-03-28 11:30:40', 'The student consistently demonstrates strong responsibility and professionalism in their collaborative work. Further development should focus on enhancing initiative and meticulous attention to detail.', '2026-03-28 03:30:40', '2026-03-28 13:05:20'),
(16, 12, 15, 'The student has shown good potential in performance and communication, especially in completing tasks and responding to guidance. There is room for improvement in discipline, particularly in time management and maintaining consistency in workplace behavior.', 'Average rating: 1.00 from 15 rated item(s)', 1.00, '2026-04-07 17:23:13', 'The student demonstrates strong potential in task completion and responsiveness to guidance. Improvement is recommended in discipline, specifically regarding time management and consistent workplace conduct.', '2026-04-07 09:23:13', '2026-04-08 01:16:51'),
(9, 9, 3, 'The supervisor noted that the intern is punctual, communicates well with the team, and submits reports on time. However, the student needs improvement in organizing documentation and should provide more detailed accomplishment narratives. Continued mentoring on report writing and task prioritization is recommended.', 'No rubric ratings selected.', NULL, '2026-03-27 23:53:16', 'The intern consistently demonstrates strong punctuality, effective team communication, and timely report submission. Improvement is needed in documentation organization and providing more detailed accomplishment narratives.', '2026-03-27 15:53:16', '2026-03-31 13:47:42'),
(10, 9, 3, 'You have been a very reliable member of our team throughout your internship period. You consistently finish your assigned tasks on time and always follow our office protocols. Your focus on quality and your disciplined work ethic are truly appreciated by the department.', 'No rubric ratings selected.', NULL, '2026-03-28 07:03:00', 'The intern consistently demonstrated reliability, timely task completion, and adherence to protocols, reflecting a strong work ethic and commitment to quality. Continued development should focus on expanding beyond assigned tasks to proactively identify and address departmental needs.', '2026-03-27 23:03:00', '2026-03-31 13:47:39'),
(11, 9, 3, 'I am impressed by how quickly you pick up new concepts and apply them to your daily tasks. You show a lot of initiative by asking the right questions and seeking ways to improve your work. This proactive attitude has allowed you to contribute meaningfully to our ongoing projects.', 'No rubric ratings selected.', NULL, '2026-03-28 07:34:09', 'The employee consistently demonstrates rapid assimilation of new concepts and proactive initiative in task application. A key area for development involves further enhancing independent problem-solving without frequent supervisory consultation.', '2026-03-27 23:34:09', '2026-03-31 13:47:36'),
(12, 10, 3, 'You have been a very reliable member of our team throughout your internship period. You consistently finish your assigned tasks on time and always follow our office protocols. Your focus on quality and your disciplined work ethic are truly appreciated by the department', 'No rubric ratings selected.', NULL, '2026-03-28 07:46:14', 'The intern consistently demonstrated reliability, timely task completion, and adherence to protocols, reflecting a strong work ethic and focus on quality. Continued development should concentrate on expanding contributions beyond assigned tasks to proactively identify and address departmental needs.', '2026-03-27 23:46:14', '2026-03-28 13:05:25'),
(13, 10, 12, 'You have been a very reliable member of our team throughout your internship period. You consistently finish your assigned tasks on time and always follow our office protocols. Your focus on quality and your disciplined work ethic are truly appreciated by the department', 'No rubric ratings selected.', NULL, '2026-03-28 07:46:14', 'The intern consistently demonstrated reliability, timely task completion, and adherence to protocols, reflecting a strong work ethic and focus on quality. Continued development should concentrate on expanding contributions beyond assigned tasks to proactively identify and address departmental needs.', '2026-03-27 23:46:14', '2026-03-28 13:05:25');

-- --------------------------------------------------------

--
-- Table structure for table `internship_assignment`
--

CREATE TABLE `internship_assignment` (
  `iassignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `hte_id` int(11) NOT NULL,
  `coordinator_id` int(11) DEFAULT NULL,
  `sipp_id` int(11) DEFAULT NULL,
  `location_scope` varchar(255) DEFAULT NULL,
  `subject_taught` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `year_level` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `internship_assignment`
--

INSERT INTO `internship_assignment` (`iassignment_id`, `student_id`, `hte_id`, `coordinator_id`, `sipp_id`, `location_scope`, `subject_taught`, `start_date`, `end_date`, `year_level`, `created_at`, `updated_at`) VALUES
(7, 2, 1, 1, 4, 'Local', 'Internship Practice', '2026-03-10', '2026-05-30', 4, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(8, 6, 2, 1, 4, 'Local', 'Internship Practice', '2026-03-10', '2026-05-30', 4, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(9, 7, 5, 14, 4, 'Local', 'Internship Practice', '2026-04-13', '2026-05-25', 3, '2026-03-20 10:11:55', '2026-04-07 10:39:20'),
(10, 8, 5, 14, 4, 'Local', 'Internship Practice', '2026-04-20', '2026-05-25', 3, '2026-03-20 10:11:55', '2026-04-07 10:38:30'),
(11, 9, 2, 1, 4, 'Local', 'Internship Practice', '2026-03-10', '2026-05-30', 4, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(12, 16, 5, 14, NULL, NULL, NULL, '2026-05-11', '2026-06-30', 3, '2026-04-07 08:32:46', '2026-04-07 08:32:46'),
(13, 10, 5, 14, NULL, NULL, NULL, '2026-04-13', '2026-05-25', 3, '2026-04-07 10:38:54', '2026-04-07 10:38:54');

-- --------------------------------------------------------

--
-- Table structure for table `internship_details`
--

CREATE TABLE `internship_details` (
  `internship_details_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `hte_id` int(11) NOT NULL,
  `coordinator_id` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `internship_details`
--

INSERT INTO `internship_details` (`internship_details_id`, `student_id`, `hte_id`, `coordinator_id`, `start_date`, `end_date`, `location`, `position`, `remarks`, `created_at`, `updated_at`) VALUES
(7, 2, 1, 1, '2026-03-10', '2026-05-30', 'Candijay', 'Documentation Assistant', 'Pre-oral demo assignment', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(8, 6, 2, 1, '2026-03-10', '2026-05-30', 'Tagbilaran', 'Inventory Support', 'Pre-oral demo assignment', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(9, 7, 1, 1, '2026-03-10', '2026-05-30', 'Candijay', 'Front Desk Assistant', 'Pre-oral demo assignment', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(10, 8, 3, 1, '2026-03-10', '2026-05-30', 'Candijay', 'Data Encoder', 'Pre-oral demo assignment', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(11, 9, 2, 1, '2026-03-10', '2026-05-30', 'Tagbilaran', 'Operations Assistant', 'Pre-oral demo assignment', '2026-03-20 10:11:55', '2026-03-20 10:11:55');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message_text` text NOT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `is_read` enum('0','1') DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `sender_id`, `receiver_id`, `subject`, `message_text`, `attachment_url`, `attachment_name`, `is_read`, `created_at`) VALUES
(6, 8, 3, 'Task clarification', 'Good afternoon, Sir. I have updated the inventory records and need confirmation on the missing item codes noted in the sheet.', NULL, NULL, '', '2026-03-20 10:11:56'),
(7, 3, 8, 'Re: Task clarification', 'Please annotate the missing codes in the remarks column, then resubmit your accomplishment report for final review.', NULL, NULL, '0', '2026-03-20 10:11:56'),
(8, 1, 10, 'Placement update', 'Your semester roster record is already active. We are finalizing your host company placement and will update you once confirmed.', NULL, NULL, '', '2026-03-20 10:11:56'),
(9, 1, 2, '', 'good morning', NULL, NULL, '0', '2026-03-31 10:29:21'),
(10, 3, 1, '', 'hello sir', NULL, NULL, '0', '2026-03-31 10:31:28'),
(11, 1, 3, '', 'good evening!', NULL, NULL, '0', '2026-03-31 11:00:59'),
(12, 1, 3, '', 'hello', NULL, NULL, '0', '2026-04-03 09:30:48'),
(13, 1, 3, '', 'hello', NULL, NULL, '0', '2026-04-03 09:34:46'),
(14, 1, 3, '', 'hello', NULL, NULL, '0', '2026-04-03 09:34:50'),
(15, 14, 3, '', 'hello', NULL, NULL, '0', '2026-04-05 11:34:33'),
(16, 14, 3, '', 'asass', NULL, NULL, '0', '2026-04-06 00:39:37'),
(17, 15, 16, '', 'hello', NULL, NULL, '0', '2026-04-07 09:23:55');

-- --------------------------------------------------------

--
-- Table structure for table `requirements`
--

CREATE TABLE `requirements` (
  `requirements_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `file_path` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `requirements`
--

INSERT INTO `requirements` (`requirements_id`, `student_id`, `assignment_id`, `type_id`, `status_id`, `semester_id`, `file_path`, `created_at`, `updated_at`) VALUES
(14, 2, 7, 1, 3, 2, 'uploads/requirements/demo/student-a-moa.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(15, 2, 7, 2, 3, 2, 'uploads/requirements/demo/student-a-resume.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(16, 2, 7, 3, 3, 2, 'uploads/requirements/demo/student-a-medical.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(17, 6, 8, 1, 3, 2, 'uploads/requirements/demo/student-b-moa.pdf', '2026-03-20 10:11:55', '2026-03-28 13:04:39'),
(18, 7, 9, 1, 3, 2, 'uploads/requirements/demo/student-c-moa.pdf', '2026-03-20 10:11:55', '2026-03-28 08:01:45'),
(19, 7, 9, 2, 4, 2, 'uploads/requirements/demo/student-c-resume.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(20, 8, 10, 1, 3, 2, 'uploads/requirements/demo/student-d-moa.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(21, 8, 10, 4, 3, 2, 'uploads/requirements/demo/student-d-parent-consent.pdf', '2026-03-20 10:11:55', '2026-03-20 10:20:03'),
(22, 9, 11, 1, 3, 2, 'uploads/requirements/demo/student-e-moa.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(23, 9, 11, 2, 3, 2, 'uploads/requirements/demo/student-e-resume.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(24, 9, 11, 3, 3, 2, 'uploads/requirements/demo/student-e-medical.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(25, 9, 11, 5, 3, 2, 'uploads/requirements/demo/student-e-endorsement.pdf', '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(26, 7, 9, 2, 1, 3, 'uploads/requirements/7_1775390346_Resume.jpg', '2026-04-05 11:59:06', '2026-04-05 11:59:06'),
(27, 2, 7, 1, 1, 3, 'uploads/requirements/2_1775515837_MOA.jpg', '2026-04-06 22:50:37', '2026-04-06 22:50:37'),
(28, 2, 7, 2, 1, 3, 'uploads/requirements/2_1775516438_Resume.jpg', '2026-04-06 23:00:38', '2026-04-06 23:00:38'),
(29, 2, 7, 3, 1, 3, 'uploads/requirements/2_1775516885_Medical_Certificate.jpg', '2026-04-06 23:08:05', '2026-04-06 23:08:05'),
(30, 2, 7, 4, 1, 3, 'uploads/requirements/2_1775516934_Parent_Consent.jpg', '2026-04-06 23:08:54', '2026-04-06 23:08:54'),
(31, 7, 9, 1, 1, 3, 'uploads/requirements/7_1775563516_MOA.jpg', '2026-04-07 12:05:16', '2026-04-07 12:05:16'),
(32, 7, 9, 3, 1, 3, 'uploads/requirements/7_1775563563_Medical_Certificate.jpg', '2026-04-07 12:06:03', '2026-04-07 12:06:03');

-- --------------------------------------------------------

--
-- Table structure for table `requirement_type`
--

CREATE TABLE `requirement_type` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `requirement_type`
--

INSERT INTO `requirement_type` (`type_id`, `type_name`) VALUES
(1, 'MOA'),
(2, 'Resume'),
(3, 'Medical Certificate'),
(4, 'Parent Consent'),
(5, 'Endorsement Letter'),
(6, 'Application Letter'),
(7, 'Resume/Curriculum Vitae'),
(8, 'Memorandum of Agreement'),
(9, 'Internship Agreement'),
(10, 'Parents\' Consent/Waiver'),
(11, 'Drug Test'),
(12, 'Complete Blood Count (CBC)'),
(13, 'Urinalysis'),
(14, 'Chest X-Ray'),
(15, 'Pregnancy Test'),
(16, 'Daily Time Record (DTR)'),
(17, 'Performance Evaluation'),
(18, 'Accomplishment Report'),
(19, 'Overtime / Duty Day-off Request Letter'),
(20, 'Certificate of Attendance - Internship Orientation'),
(21, 'Certificate of Completion'),
(22, 'Documentations');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(1, 'coordinator'),
(2, 'student'),
(3, 'supervisor'),
(4, 'admin'),
(5, 'chairperson');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `coordinator_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `visit_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `coordinator_id`, `student_id`, `visit_date`, `created_at`, `updated_at`) VALUES
(1, 1, 2, '2026-03-10', '2026-03-09 06:09:05', '2026-03-09 06:09:05'),
(2, 14, 2, '2026-04-05', '2026-04-05 10:53:45', '2026-04-05 10:53:45');

-- --------------------------------------------------------

--
-- Table structure for table `semester`
--

CREATE TABLE `semester` (
  `semester_id` int(11) NOT NULL,
  `semester_period` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `semester`
--

INSERT INTO `semester` (`semester_id`, `semester_period`) VALUES
(1, '1st Semester'),
(2, '2nd Semester'),
(3, 'Summer');

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

CREATE TABLE `status` (
  `status_id` int(11) NOT NULL,
  `status_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `status`
--

INSERT INTO `status` (`status_id`, `status_name`) VALUES
(1, 'Submitted'),
(2, 'Late'),
(3, 'Approved'),
(4, 'For Revision'),
(5, 'Present'),
(6, 'Pending'),
(7, 'In Progress'),
(8, 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `student_semester_roster`
--

CREATE TABLE `student_semester_roster` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `school_year` varchar(32) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_semester_roster`
--

INSERT INTO `student_semester_roster` (`id`, `student_id`, `semester_id`, `school_year`, `is_active`, `uploaded_by`, `created_at`, `updated_at`) VALUES
(7, 2, 2, '2025-2026', 1, 1, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(8, 6, 2, '2025-2026', 1, 1, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(9, 7, 2, '2025-2026', 1, 1, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(10, 8, 2, '2025-2026', 1, 1, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(11, 9, 2, '2025-2026', 1, 1, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(12, 10, 2, '2025-2026', 1, 1, '2026-03-20 10:11:55', '2026-03-20 10:11:55');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `tasks_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `supervisors_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`tasks_id`, `student_id`, `supervisors_id`, `assignment_id`, `title`, `description`, `due_date`, `status_id`, `created_at`, `updated_at`) VALUES
(5, 2, 3, 7, 'Prepare weekly filing tracker', 'Consolidate all completed documents for week 2 filing.', '2026-03-21', 8, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(6, 8, 3, 10, 'Update inventory records', 'Encode the remaining stock cards into the shared sheet.', '2026-03-22', 8, '2026-03-20 10:11:55', '2026-04-04 22:17:35'),
(7, 8, 3, 10, 'Prepare accomplishment summary', 'Draft a concise daily accomplishment summary for review.', '2026-03-23', 6, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(8, 9, 3, 11, 'Assist in operations report', 'Support the weekly operations summary and highlight key observations.', '2026-03-21', 8, '2026-03-20 10:11:55', '2026-03-20 10:11:55'),
(9, 2, 3, 7, 'Submit Accomplishment Report', 'Prepare and upload your accomplishment report covering the assigned internship tasks completed this period.', '2026-09-04', 7, '2026-04-07 08:16:02', '2026-04-07 08:16:31'),
(10, 16, 15, 12, 'Organize Project Documentation', 'Compile screenshots, reports, and related project files into one organized folder for documentation.', '2026-06-30', 7, '2026-04-07 09:11:25', '2026-04-07 09:11:32');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_num` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `college_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `first_name`, `last_name`, `email`, `role_id`, `gender`, `address`, `phone_num`, `password`, `position`, `college_id`, `department_id`, `created_at`, `updated_at`) VALUES
(1, 'vince pinedo', 'vince', 'pinedo', 'vincepinedo123@gmail.com', 1, NULL, '', '', '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', NULL, NULL, NULL, '2026-02-26 18:48:42', '2026-03-24 15:55:30'),
(2, 'Rheto Postanes', 'Rheto', 'Postanes', 'jintankun009@gmail.com', 2, NULL, '', '', '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', 'Documentation Assistant', NULL, NULL, '2026-02-26 18:50:14', '2026-03-24 15:55:30'),
(3, 'Aires Beltran', 'Aires', 'Beltran', 'airesbeltran@gmail.com', 3, NULL, 'Pasto', '', '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', NULL, NULL, NULL, '2026-02-26 20:59:22', '2026-03-24 15:55:30'),
(4, 'sipp admin', 'sipp', 'admin', 'sipp.admin@biims.local', 4, NULL, '', '', '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', NULL, NULL, NULL, '2026-03-04 13:37:09', '2026-03-24 15:55:30'),
(5, 'Chairperson Chairperson', 'Chairperson', 'Chairperson', 'chairperson@gmail.com', 5, NULL, '', '', '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', NULL, NULL, NULL, '2026-03-04 23:52:16', '2026-03-24 15:55:30'),
(6, 'Mark Dela Cruz', 'Mark', 'Dela Cruz', 'student01@biims.local', 2, NULL, NULL, NULL, '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', 'Inventory Support', NULL, NULL, '2026-03-20 10:11:12', '2026-03-24 15:55:30'),
(7, 'Jessa Villamor', 'Jessa', 'Villamor', 'student02@biims.local', 2, NULL, NULL, NULL, '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', 'Front Desk Assistant', NULL, NULL, '2026-03-20 10:11:12', '2026-03-24 15:55:30'),
(8, 'Nina Caballes', 'Nina', 'Caballes', 'student03@biims.local', 2, NULL, NULL, NULL, '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', 'Data Encoder', NULL, NULL, '2026-03-20 10:11:12', '2026-03-24 15:55:30'),
(9, 'Paolo Briones', 'Paolo', 'Briones', 'student04@biims.local', 2, NULL, NULL, NULL, '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', 'Operations Assistant', NULL, NULL, '2026-03-20 10:11:12', '2026-03-24 15:55:30'),
(10, 'Karen Salazar', 'Karen', 'Salazar', 'student05@biims.local', 2, NULL, NULL, NULL, '$2y$10$dGhlHySWQ1r1/lp.SoWMmuaHugxrz7PPqIsSHDLV9sCvA/ELrqpQ2', 'Student Intern', NULL, NULL, '2026-03-20 10:11:13', '2026-03-24 15:55:30'),
(12, 'Mr. John Smith', 'Mr.', 'John Smith', 'johnsmith@gmail.com', 3, NULL, NULL, NULL, '$2y$10$EME3U2H//TnHcv.v8JJt3Os8CEvUicIsPAACFgNXRJOAvC3dXiFq2', NULL, NULL, NULL, '2026-03-27 23:44:08', '2026-03-27 23:44:08'),
(13, 'sky sky', 'sky', 'sky', 'sky@gmail.com', 3, NULL, NULL, NULL, '$2y$10$dLA92/if/fsaRDfm/J05bOqakMsR3Jcy75XVO6KvSk7gDPnz0Xfyi', NULL, NULL, NULL, '2026-03-30 10:06:45', '2026-03-30 10:06:45'),
(14, 'Mark Zuckerberg', 'Mark', 'Zuckerberg', 'coordinator@gmail.com', 1, NULL, '', '09702222047', '$2y$10$WxKYGgQLTNA.bsNIC.LApOkrANQVYoi6l78UyY9NI8IJa8QpKeuLa', NULL, NULL, NULL, '2026-03-31 23:11:10', '2026-04-05 00:18:29'),
(15, 'Bill Gates', 'Bill', 'Gates', 'supervisor@gmail.com', 3, NULL, '', '', '$2y$10$HCcKp1PNwkmNqFSvpYlLy.anRqGNAEH9kuOrepz6FKOR38q9oc6Zm', NULL, NULL, NULL, '2026-04-05 00:37:00', '2026-04-05 01:45:15'),
(16, 'Juan Dela Cruz', 'Juan', 'Dela Cruz', 'student@bisu.edu.ph', 2, NULL, '', '', '$2y$10$dayNKloeu0YVc3VsCXOn2O/I3RFHUFZS4H3KnGm7ve7vwvmSxv5lG', NULL, 1, 1, '2026-04-07 08:26:31', '2026-04-07 08:49:48');

COMMIT;