<?php
// Replace with your real email address
$to = 'blessedwingtech@gmail.com';

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    
    // Check required fields
    if (
        isset($_POST["name"], $_POST["email"], $_POST["subject"], $_POST["message"])
    ) {
        // Sanitize inputs
        $name    = strip_tags(trim($_POST["name"]));
        $email   = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
        $subject = strip_tags(trim($_POST["subject"]));
        $message = strip_tags(trim($_POST["message"]));
        
        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo "Invalid email address.";
            exit;
        }

        // Prepare the email
        $email_subject = "New message from your portfolio: $subject";
        $email_body = "Name: $name\n";
        $email_body .= "Email: $email\n";
        $email_body .= "Subject: $subject\n\n";
        $email_body .= "Message:\n$message\n";

        $headers = "From: $name <$email>";

        // Send the email
        if (mail($to, $email_subject, $email_body, $headers)) {
            echo "Your message has been sent. Thank you!";
        } else {
            echo "Something went wrong. Please try again.";
        }

    } else {
        echo "Please complete all required fields.";
    }
} else {
    echo "Invalid request.";
}
?>
