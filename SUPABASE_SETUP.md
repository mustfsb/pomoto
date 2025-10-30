# Supabase Email OTP Kurulumu

Email doğrulama kodlarının çalışması için Supabase email template'ini güncellemeniz gerekiyor.

## Adımlar:

1. **Supabase Dashboard'a gidin**: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **Authentication** > **Email Templates** bölümüne gidin
4. **Confirm signup** template'ini seçin
5. Email içeriğini **TAM OLARAK** aşağıdaki gibi güncelleyin:

\`\`\`html
<h2>Email Adresinizi Doğrulayın</h2>
<p>Merhaba,</p>
<p>Hesabınızı doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
<h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 8px;">
  {{ .Token }}
</h1>
<p>Bu kod 60 dakika geçerlidir.</p>
<p>Eğer bu hesabı siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
\`\`\`

6. **Save** butonuna tıklayın

## ÖNEMLİ:

- `{{ .Token }}` bir **LINK DEĞİL**, 6 haneli bir **KOD**dur (örnek: 123456)
- `<a href="{{ .Token }}">` şeklinde KULLANMAYIN
- Sadece `{{ .Token }}` yazın, Supabase bunu otomatik olarak kod ile değiştirir
- Eski template'de `{{ .ConfirmationURL }}` varsa, onu tamamen silin

## Yanlış Kullanım ❌:
\`\`\`html
<a href="{{ .Token }}">Confirm your mail</a>
\`\`\`

## Doğru Kullanım ✅:
\`\`\`html
<h1>{{ .Token }}</h1>
\`\`\`

## Test:

1. Yeni bir hesap oluşturun
2. Email'inizi kontrol edin
3. 6 haneli doğrulama kodunu görmelisiniz (örnek: 482951)
4. Kodu doğrulama sayfasına girin

Sorun yaşarsanız, Supabase Dashboard'da Authentication > Logs bölümünden email gönderim loglarını kontrol edebilirsiniz.
