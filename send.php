<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Метод не разрешён']);
    exit;
}

$name  = trim($_POST['user_name']  ?? '');
$phone = trim($_POST['user_phone'] ?? '');
$email = trim($_POST['user_email'] ?? '');

$name  = htmlspecialchars($name,  ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');

if (empty($name) || empty($phone)) {
    echo json_encode(['status' => 'error', 'message' => 'Заполните имя и телефон']);
    exit;
}

$to      = 'todaydarya@gmail.com';
$subject = 'Новая заявка с сайта';
$from    = 'noreply@ваш-сайт.ru';

$message  = "Поступила новая заявка с сайта\n";
$message .= "================================\n\n";
$message .= "Имя:     {$name}\n";
$message .= "Телефон: {$phone}\n";
$message .= "Email:   " . ($email ?: 'не указан') . "\n";
$message .= "Дата:    " . date('d.m.Y H:i:s') . "\n";

$headers  = "From: {$from}\r\n";
$headers .= "Reply-To: " . ($email ?: $from) . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo json_encode([
        'status'  => 'success',
        'message' => 'Заявка отправлена'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Ошибка отправки'
    ]);
}
?>