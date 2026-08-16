# L2TP Server على VPS (ShamSTC)

## 1) تشغيل السيرفر

```bash
# من مجلد المشروع
cd l2tp
cp .env.example .env
nano .env   # غيّر كلمات المرور

# تأكد من اسم الشبكة المشتركة مع المشروع
docker network ls | grep isp

# إن كان اسم الشبكة مختلفاً عدّل docker-compose.l2tp.yml
# ثم:
docker compose -f docker-compose.l2tp.yml up -d
docker logs -f isp_l2tp
```

افتح في جدار ناري الـ VPS (Hostinger / ufw):

- UDP 500
- UDP 4500

## 2) إعداد MikroTik كـ Client

```routeros
/interface l2tp-client
add name=to-shamstc \
    connect-to=IP_الـ_VPS_العام \
    user=damascus-mt \
    password=DamascusPass#2026 \
    use-ipsec=yes \
    ipsec-secret=ShamSTC-Ipsec-ChangeThis-2026! \
    disabled=no \
    add-default-route=no \
    profile=default-encryption

# بعد الاتصال ستحصل على IP من السيرفر (مثلاً 192.168.42.10)
/ip address print where interface=to-shamstc

# اسمح بالـ API من شبكة النفق فقط
/ip service set api disabled=no address=192.168.42.0/24
```

## 3) تسجيل الجهاز في ShamSTC

من الواجهة `/mikrotik-devices` أو API:

```json
{
  "name": "Damascus-MT-01",
  "region": "Damascus",
  "vpnIp": "192.168.42.10",
  "ipAddress": "192.168.42.10",
  "username": "admin",
  "password": "كلمة_مرور_الراوتر",
  "apiPort": 8728,
  "connectionType": "L2TP",
  "isEnabled": true
}
```

ثم `POST /api/mikrotik-devices/{id}/check`

## 4) ربط العميل بالراوتر

عند إنشاء/تعديل عميل ضع `mikroTikServerId` = معرّف الجهاز.
`ExpirationService` وعمليات الفصل ستستخدم هذا الراوتر تلقائياً.

## ملاحظة عن عناوين IP

صورة `hwdsl2/ipsec-vpn-server` تستخدم غالباً `192.168.42.0/24`.
إن أردت `10.50.0.0/24` ثابتاً لكل راوتر، يمكن لاحقاً ضبط عناوين ثابتة على جانب MikroTik أو استخدام WireGuard بدل L2TP.

## أوامر مفيدة

```bash
docker ps | grep l2tp
docker logs isp_l2tp --tail 50
docker compose -f docker-compose.l2tp.yml restart
```
