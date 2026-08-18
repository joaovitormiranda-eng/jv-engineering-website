import numpy as np
import matplotlib.pyplot as plt

fig = plt.figure(figsize=(8, 6))
ax = fig.add_subplot(111, projection='3d')

# Malha para o corpo do cilindro
theta = np.linspace(0, 2*np.pi, 50)
x = np.linspace(-2, -1, 30)
THETA, X = np.meshgrid(theta, x)

Y = 1.0 * np.cos(THETA)
Z = 1.0 * np.sin(THETA)

# Plotando a casca lateral do cilindro
ax.plot_surface(X, Y, Z, color='cyan', alpha=0.5, edgecolor='k', linewidth=0.2)

# Tampas planas (x = -2 e x = -1)
r = np.linspace(0, 1, 20)
R, THETA_T = np.meshgrid(r, theta)
Y_t = R * np.cos(THETA_T)
Z_t = R * np.sin(THETA_T)

ax.plot_surface(np.full_like(Y_t, -2), Y_t, Z_t, color='blue', alpha=0.6)
ax.plot_surface(np.full_like(Y_t, -1), Y_t, Z_t, color='blue', alpha=0.6)

# Ajustes de eixos e visualização
ax.set_xlabel('Eixo X')
ax.set_ylabel('Eixo Y')
ax.set_zlabel('Eixo Z')
ax.set_title('Sólido V: Cilindro entre x = -2 e x = -1')

plt.show()